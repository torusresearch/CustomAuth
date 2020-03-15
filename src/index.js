import Torus from '@toruslabs/torus.js'
import {
    DISCORD,
    FACEBOOK,
    GOOGLE,
    REDDIT,
    RPC,
    SUPPORTED_NETWORK_TYPES,
    TWITCH,
    USER_INFO_REQUEST_APPROVED,
    USER_INFO_REQUEST_REJECTED
  } from './utils/enums'
import { get, post, remove } from './utils/httpHelpers'
import PopupHandler from './utils/PopupHandler'
import { BroadcastChannel } from 'broadcast-channel'
import log from 'loglevel'
import { broadcastChannelOptions } from './utils/utils'
import NodeDetailManager from '@toruslabs/fetch-node-details'

const torus = new Torus()

torus.instanceID = "test"

class DirectWebSDK {
  constructor({
    GOOGLE_CLIENT_ID = '876733105116-i0hj3s53qiio5k95prpfmj0hp0gmgtor.apps.googleusercontent.com',
    FACEBOOK_APP_ID = '2554219104599979',
    TWITCH_CLIENT_ID = 'tfppratfiloo53g1x133ofa4rc29px',
    REDDIT_CLIENT_ID = 'dcQJYPaG481XyQ',
    DISCORD_CLIENT_ID = '630308572013527060',
    redirect_uri = 'https://localhost:3000/redirect',
    network = "mainnet", 
    proxyContractAddress = "0x638646503746d5456209e33a2ff5e3226d698bea"
  } = {}) {
    this.config = {
      GOOGLE_CLIENT_ID: GOOGLE_CLIENT_ID,
      FACEBOOK_APP_ID: FACEBOOK_APP_ID,
      TWITCH_CLIENT_ID: TWITCH_CLIENT_ID,
      REDDIT_CLIENT_ID: REDDIT_CLIENT_ID,
      DISCORD_CLIENT_ID: DISCORD_CLIENT_ID,
      redirect_uri: redirect_uri
    }
    this.torus = torus
    this.nodeDetailManager =  new NodeDetailManager({network:network, proxyAddress:proxyContractAddress})
  }

 
 triggerLogin(verifier) {
  log.info('Verifier: ', verifier)

  if (verifier === GOOGLE) {
    const state = encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: torus.instanceId,
          verifier: GOOGLE
        })
      )
    )
    const scope = 'profile email openid'
    const responseType = 'token id_token'
    const prompt = 'consent select_account'
    const finalUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${this.config.GOOGLE_CLIENT_ID}` +
      `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}&nonce=${torus.instanceId}&prompt=${prompt}`
    const googleWindow = new PopupHandler({ url: finalUrl })
    const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions)
    bc.addEventListener('message', async ev => {
      try {
        const {
          instanceParams: { verifier: returnedVerifier },
          hashParams: verifierParameters
        } = ev.data || {}
        if (ev.error && ev.error !== '') {
          log.error(ev.error)
        } else if (ev.data && returnedVerifier === GOOGLE) {
          log.info(ev.data)
          const { access_token: accessToken, id_token: idToken } = verifierParameters
          const userInfo = await get('https://www.googleapis.com/userinfo/v2/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          const { picture: profileImage, email, name } = userInfo || {}
          console.log("AT HANDLE LOGIN with " +email.toString().toLowerCase() )
          return await this.handleLogin(GOOGLE,email.toString().toLowerCase(),{ verifier_id: email.toString().toLowerCase() }, idToken)
        }
      } catch (error) {
        log.error(error)
      } finally {
        bc.close()
        googleWindow.close()
      }
    })
    googleWindow.open()
    googleWindow.once('close', () => {
      bc.close()
    })
  } else if (verifier === FACEBOOK) {
    const state = encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: torus.instanceId,
          verifier: FACEBOOK
        })
      )
    )
    const scope = 'public_profile email'
    const responseType = 'token'
    const finalUrl =
      `https://www.facebook.com/v6.0/dialog/oauth?response_type=${responseType}&client_id=${this.config.FACEBOOK_APP_ID}` +
      `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`
    const facebookWindow = new PopupHandler({ url: finalUrl })
    const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions)
    bc.addEventListener('message', async ev => {
      try {
        const {
          instanceParams: { verifier: returnedVerifier },
          hashParams: verifierParameters
        } = ev.data || {}
        if (ev.error && ev.error !== '') {
          log.error(ev.error)
        } else if (ev.data && returnedVerifier === FACEBOOK) {
          log.info(ev.data)
          const { access_token: accessToken } = verifierParameters
          const userInfo = await get('https://graph.facebook.com/me?fields=name,email,picture.type(large)', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          const { name, id, picture, email } = userInfo || {}
          await this.handleLogin(FACEBOOK, id.toString(),{ verifier_id: id.toString() }, accessToken)
        }
      } catch (error) {
        log.error(error)
      } finally {
        bc.close()
        facebookWindow.close()
      }
    })
    facebookWindow.open()
    facebookWindow.once('close', () => {
      bc.close()
    })
  } else if (verifier === TWITCH) {
    const state = encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: torus.instanceId,
          verifier: TWITCH
        })
      )
    )
    const claims = JSON.stringify({
      id_token: {
        email: null
      },
      userinfo: {
        picture: null,
        preferred_username: null
      }
    })
    const finalUrl =
      `https://id.twitch.tv/oauth2/authorize?client_id=${this.config.TWITCH_CLIENT_ID}&redirect_uri=` +
      `${this.config.redirect_uri}&response_type=token%20id_token&scope=user:read:email+openid&claims=${claims}&state=${state}`
    const twitchWindow = new PopupHandler({ url: finalUrl })
    const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions)
    bc.addEventListener('message', async ev => {
      try {
        log.info(ev.data)
        const {
          instanceParams: { verifier: returnedVerifier },
          hashParams: verifierParameters
        } = ev.data || {}
        if (ev.error && ev.error !== '') {
          log.error(ev.error)
        } else if (ev.data && returnedVerifier === TWITCH) {
          const { access_token: accessToken, id_token: idtoken } = verifierParameters
          const userInfo = await get('https://id.twitch.tv/oauth2/userinfo', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          const tokenInfo = jwtDecode(idtoken)
          const { picture: profileImage, preferred_username: name } = userInfo || {}
          const { email } = tokenInfo || {}
          await this.handleLogin(TWITCH, userInfo.sub.toString(),{ verifier_id: userInfo.sub.toString() }, accessToken.toString())
        }
      } catch (error) {
        log.error(error)
      } finally {
        bc.close()
        twitchWindow.close()
      }
    })
    twitchWindow.open()
    twitchWindow.once('close', () => {
      bc.close()
    })
  } else if (verifier === REDDIT) {
    const state = encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: torus.instanceId,
          verifier: REDDIT
        })
      )
    )
    const finalUrl =
      `https://www.reddit.com/api/v1/authorize?client_id=${this.config.REDDIT_CLIENT_ID}&redirect_uri=` +
      `${this.config.redirect_uri}&response_type=token&scope=identity&state=${state}`
    const redditWindow = new PopupHandler({ url: finalUrl })
    const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions)
    bc.addEventListener('message', async ev => {
      try {
        const {
          instanceParams: { verifier: returnedVerifier },
          hashParams: verifierParameters
        } = ev.data || {}
        log.info(ev.data)
        if (ev.error && ev.error !== '') {
          log.error(ev.error)
        } else if (ev.data && returnedVerifier === REDDIT) {
          const { access_token: accessToken } = verifierParameters
          const userInfo = await get('https://oauth.reddit.com/api/v1/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          const { icon_img: profileImage, name } = userInfo || {}
          await this.handleLogin(REDDIT, name.toString().toLowerCase(),{ verifier_id: name.toString().toLowerCase() }, accessToken)
        }
      } catch (error) {
        log.error(error)
      } finally {
        bc.close()
        redditWindow.close()
      }
    })
    redditWindow.open()
    redditWindow.once('close', () => {
      bc.close()
    })
  } else if (verifier === DISCORD) {
    const state = encodeURIComponent(
      window.btoa(
        JSON.stringify({
          instanceId: torus.instanceId,
          verifier: DISCORD
        })
      )
    )
    const scope = encodeURIComponent('identify email')
    const finalUrl =
      `https://discordapp.com/api/oauth2/authorize?response_type=token&client_id=${this.config.DISCORD_CLIENT_ID}` +
      `&state=${state}&scope=${scope}&redirect_uri=${encodeURIComponent(this.config.redirect_uri)}`
    const discordWindow = new PopupHandler({ url: finalUrl })
    const bc = new BroadcastChannel(`redirect_channel_${torus.instanceId}`, broadcastChannelOptions)
    bc.addEventListener('message', async ev => {
      try {
        const {
          instanceParams: { verifier: returnedVerifier },
          hashParams: verifierParameters
        } = ev.data || {}
        log.info(ev.data)
        if (ev.error && ev.error !== '') {
          log.error(ev.error)
        } else if (ev.data && returnedVerifier === DISCORD) {
          const { access_token: accessToken } = verifierParameters
          const userInfo = await get('https://discordapp.com/api/users/@me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          })
          const { id, avatar, email, username: name, discriminator } = userInfo || {}
          const profileImage =
            avatar === null
              ? `https://cdn.discordapp.com/embed/avatars/${discriminator % 5}.png`
              : `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=2048`
          await this.handleLogin(DISCORD, id.toString(),{ verifier_id: id.toString() }, accessToken)
        }
      } catch (error) {
        log.error(error)
      } finally {
        bc.close()
        discordWindow.close()
      }
    })
    discordWindow.open()
    discordWindow.once('close', () => {
      bc.close()
    })
  }
}


async handleLogin(verifier, verifierId, verifierParams, idToken) {
  let torusNodeEndpoints
  let torusIndexes
  return this.nodeDetailManager
    .getNodeDetails()
    .then(({ torusNodeEndpoints: torusNodeEndpointsValue, torusNodePub, torusIndexes: torusIndexesValue }) => {
      torusNodeEndpoints = torusNodeEndpointsValue
      torusIndexes = torusIndexesValue
      return torus.getPublicAddress(torusNodeEndpoints, torusNodePub, { verifier, verifierId })
    })
    .then(response => {
      log.info('New private key assigned to user at address ', response)
      const p1 = torus.retrieveShares(torusNodeEndpoints, torusIndexes, verifier, verifierParams, idToken)
      // const p2 = torus.getMessageForSigning(response)
      return Promise.all([p1])
    })
    .then(async response => {
      const data = response[0]
      // const message = response[1]
      // dispatch('addWallet', data) // synchronous
      // dispatch('subscribeToControllers')
      // await Promise.all([
      //   dispatch('initTorusKeyring', data),
      //   dispatch('processAuthMessage', { message, selectedAddress: data.ethAddress, calledFromEmbed })
      // ])
      // dispatch('updateSelectedAddress', { selectedAddress: data.ethAddress }) // synchronous
      // continue enable function
      const { ethAddress } = data
      console.log(data)
      // statusStream.write({ loggedIn: true, rehydrate: false, verifier })
      // commit('setLoginInProgress', false)
      // torus.updateStaticData({ isUnlocked: true })
      // dispatch('cleanupOAuth', { idToken })
      return data
    })
    .catch(error => {
      log.error(error)
    })
}

}



export default DirectWebSDK;