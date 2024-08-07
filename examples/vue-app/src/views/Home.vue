<template>
  <div class="w-full flex-1 block lg:flex items-center">
    <div class="flex gap-4 mx-auto h-full w-full p-4 sm:py-6 sm:px-10">
      <div class="flex-1 flex justify-center">
        <div class="max-w-[392px]">
          <Card :class="['px-4 py-4 gird col-span-1 p-8']">
            <h1 class="text-xl leading-tight tracking-tight text-gray-900 md:text-1xl">
              Choose a login method
            </h1>
            <div class="flex flex-col sm:flex-row">
              <router-link to="/redirectMode">
                <Button
                  :class="['w-full !h-auto group py-3 rounded-full flex items-center justify-center my-2 size-md']"
                  type="button" block size="md" pill>
                  Login with Redirect Mode
                </Button>
              </router-link>
              <router-link to="/popupMode">
                <Button
                  :class="['w-full !h-auto group py-3 rounded-full flex items-center justify-center my-2 size-md']"
                  type="button" block pill>
                  Login with Popup Mode (Not Recommended)
                </Button>
              </router-link>
            </div>
            <h6 class="text-base font-normal text-[#595857] text-center ">Note: Login with Redirect mode is recommended
            </h6>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button, Card } from "@toruslabs/vue-components";
</script>
