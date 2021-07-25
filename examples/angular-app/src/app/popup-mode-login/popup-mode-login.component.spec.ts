import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { PopupModeLoginComponent } from "./popup-mode-login.component";

describe("PopupModeLoginComponent", () => {
  let component: PopupModeLoginComponent;
  let fixture: ComponentFixture<PopupModeLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PopupModeLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopupModeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
