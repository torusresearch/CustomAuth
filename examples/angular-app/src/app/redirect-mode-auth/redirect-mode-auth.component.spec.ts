import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { RedirectModeAuthComponent } from "./redirect-mode-auth.component";

describe("RedirectModeAuthComponent", () => {
  let component: RedirectModeAuthComponent;
  let fixture: ComponentFixture<RedirectModeAuthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RedirectModeAuthComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectModeAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
