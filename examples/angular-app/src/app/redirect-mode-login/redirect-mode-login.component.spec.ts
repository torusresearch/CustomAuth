import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RedirectModeLoginComponent } from "./redirect-mode-login.component";

describe("RedirectModeLoginComponent", () => {
  let component: RedirectModeLoginComponent;
  let fixture: ComponentFixture<RedirectModeLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RedirectModeLoginComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectModeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
