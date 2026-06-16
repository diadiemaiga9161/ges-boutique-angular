import {
  BoutiqueService,
  CheckboxControlValueAccessor,
  CommonModule,
  Component,
  DefaultValueAccessor,
  FormsModule,
  NgControlStatus,
  NgControlStatusGroup,
  NgForOf,
  NgForm,
  NgIf,
  NgModel,
  Renderer2,
  RequiredValidator,
  Router,
  setClassMetadata,
  ɵNgNoValidate,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeUrl,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-RK5GU4B7.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-TXDUYLVM.js";

// src/app/views/pages/boutiques/boutique-settings.component.ts
function BoutiqueSettingsComponent_div_5_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 46);
    \u0275\u0275text(1, " Chargement des informations de la boutique ID 1... ");
    \u0275\u0275elementEnd();
  }
}
function BoutiqueSettingsComponent_div_6_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 47);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.errorMessage, " ");
  }
}
function BoutiqueSettingsComponent_div_7_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 48);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r0.successMessage, " ");
  }
}
function BoutiqueSettingsComponent_div_35_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "img", 49);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275property("src", ctx_r0.previewLogo, \u0275\u0275sanitizeUrl);
  }
}
function BoutiqueSettingsComponent_div_76_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 50);
    \u0275\u0275listener("click", function BoutiqueSettingsComponent_div_76_Template_div_click_0_listener() {
      const color_r3 = \u0275\u0275restoreView(_r2).$implicit;
      const ctx_r0 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r0.changeGlobalColor(color_r3.value));
    });
    \u0275\u0275element(1, "div", 51);
    \u0275\u0275elementStart(2, "span", 52);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const color_r3 = ctx.$implicit;
    const ctx_r0 = \u0275\u0275nextContext();
    \u0275\u0275classProp("active", ctx_r0.selectedGlobalColor === color_r3.value);
    \u0275\u0275advance();
    \u0275\u0275styleProp("background-color", color_r3.value);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(color_r3.name);
  }
}
var BoutiqueSettingsComponent = class _BoutiqueSettingsComponent {
  constructor(boutiqueService, router, renderer) {
    this.boutiqueService = boutiqueService;
    this.router = router;
    this.renderer = renderer;
    this.model = {
      id: 1,
      nom: "",
      adresse: "",
      numeroRc: "",
      numeroIfu: "",
      telephone: "",
      email: "",
      ville: "",
      pays: "",
      logoPath: ""
    };
    this.previewLogo = "";
    this.isLoading = false;
    this.isSaving = false;
    this.errorMessage = "";
    this.successMessage = "";
    this.isDarkMode = false;
    this.selectedGlobalColor = "#2a63ff";
    this.colorPalette = [
      { name: "Bleu", value: "#2a63ff", class: "color-blue" },
      { name: "Violet", value: "#7c3aed", class: "color-purple" },
      { name: "Rouge", value: "#ef4444", class: "color-red" },
      { name: "Vert", value: "#10b981", class: "color-green" },
      { name: "Orange", value: "#f97316", class: "color-orange" },
      { name: "Rose", value: "#ec4899", class: "color-pink" },
      { name: "Gris", value: "#6b7280", class: "color-gray" },
      { name: "Indigo", value: "#6366f1", class: "color-indigo" }
    ];
    this.loadPreferences();
  }
  ngOnInit() {
    this.loadBoutiqueInfo();
    this.applyTheme();
    this.applyGlobalColor();
  }
  loadBoutiqueInfo() {
    this.isLoading = true;
    this.errorMessage = "";
    this.boutiqueService.refreshBoutique().subscribe({
      next: (boutique) => {
        this.model = __spreadProps(__spreadValues({}, boutique), { id: boutique.id || 1 });
        this.previewLogo = this.model.logoPath || "";
        this.isLoading = false;
      },
      error: (error) => {
        console.warn("Failed to load boutique info", error);
        this.errorMessage = error.message || "Impossible de charger les informations de la boutique ID 1";
        this.model = __spreadProps(__spreadValues({}, this.boutiqueService.getInfo()), { id: 1 });
        this.previewLogo = this.model.logoPath || "";
        this.isLoading = false;
      }
    });
  }
  loadPreferences() {
    const savedDarkMode = localStorage.getItem("darkMode");
    const savedGlobalColor = localStorage.getItem("globalColor");
    if (savedDarkMode) {
      this.isDarkMode = savedDarkMode === "true";
    }
    if (savedGlobalColor) {
      this.selectedGlobalColor = savedGlobalColor;
    }
  }
  savePreferences() {
    localStorage.setItem("darkMode", this.isDarkMode.toString());
    localStorage.setItem("globalColor", this.selectedGlobalColor);
  }
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    this.savePreferences();
  }
  changeGlobalColor(color) {
    this.selectedGlobalColor = color;
    this.applyGlobalColor();
    this.savePreferences();
  }
  applyTheme() {
    const body = document.body;
    if (this.isDarkMode) {
      this.renderer.addClass(body, "dark-mode");
    } else {
      this.renderer.removeClass(body, "dark-mode");
    }
  }
  applyGlobalColor() {
    const root = document.documentElement;
    root.style.setProperty("--primary", this.selectedGlobalColor);
    const primarySoft = this.lightenColor(this.selectedGlobalColor, 0.85);
    root.style.setProperty("--primary-soft", primarySoft);
  }
  lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 255) + amt;
    const B = (num & 255) + amt;
    return "#" + (16777216 + (R < 255 ? R < 1 ? 0 : R : 255) * 65536 + (G < 255 ? G < 1 ? 0 : G : 255) * 256 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  }
  save() {
    if (!this.model.nom?.trim()) {
      this.errorMessage = "Le nom de la boutique est obligatoire.";
      return;
    }
    this.isSaving = true;
    this.errorMessage = "";
    this.successMessage = "";
    this.model.id = 1;
    this.boutiqueService.updateBoutique(__spreadValues({}, this.model)).subscribe({
      next: (boutique) => {
        this.model = __spreadProps(__spreadValues({}, boutique), { id: 1 });
        this.previewLogo = this.model.logoPath || "";
        this.savePreferences();
        this.successMessage = "Parametres de la boutique ID 1 enregistres dans la base.";
        this.isSaving = false;
        setTimeout(() => this.successMessage = "", 5e3);
      },
      error: (error) => {
        this.errorMessage = error.message || "Impossible d enregistrer la boutique ID 1 dans la base.";
        this.isSaving = false;
      }
    });
  }
  resetDefaults() {
    if (!confirm("R\xE9initialiser tous les param\xE8tres aux valeurs par d\xE9faut ?"))
      return;
    this.isSaving = true;
    this.errorMessage = "";
    this.successMessage = "";
    this.isDarkMode = false;
    this.selectedGlobalColor = "#2a63ff";
    this.applyTheme();
    this.applyGlobalColor();
    localStorage.removeItem("darkMode");
    localStorage.removeItem("globalColor");
    this.boutiqueService.resetToDefaults().subscribe({
      next: (boutique) => {
        this.model = __spreadProps(__spreadValues({}, boutique), { id: 1 });
        this.previewLogo = this.model.logoPath || "";
        this.successMessage = "La boutique ID 1 a ete reinitialisee dans la base.";
        this.isSaving = false;
        setTimeout(() => this.successMessage = "", 5e3);
      },
      error: (error) => {
        this.errorMessage = error.message || "Impossible de reinitialiser la boutique ID 1 dans la base.";
        this.isSaving = false;
      }
    });
  }
  cancel() {
    this.router.navigate(["/sessions/connexion"]);
  }
  onLogoChange() {
    this.previewLogo = this.model.logoPath || "";
  }
  static {
    this.\u0275fac = function BoutiqueSettingsComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _BoutiqueSettingsComponent)(\u0275\u0275directiveInject(BoutiqueService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(Renderer2));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _BoutiqueSettingsComponent, selectors: [["app-boutique-settings"]], decls: 92, vars: 28, consts: [[1, "container", "py-4"], [1, "card", "mx-auto", 2, "max-width", "800px"], [1, "card-body"], [1, "card-title", "mb-4"], ["class", "alert alert-info", 4, "ngIf"], ["class", "alert alert-danger", 4, "ngIf"], ["class", "alert alert-success", 4, "ngIf"], [3, "ngSubmit"], [1, "section", "mb-4"], [1, "section-title"], [1, "row"], [1, "col-md-6", "mb-3"], [1, "form-label"], ["name", "nom", "required", "", 1, "form-control", 3, "ngModelChange", "ngModel"], ["name", "telephone", 1, "form-control", 3, "ngModelChange", "ngModel"], ["name", "email", "type", "email", 1, "form-control", 3, "ngModelChange", "ngModel"], ["name", "adresse", 1, "form-control", 3, "ngModelChange", "ngModel"], [1, "mb-3"], ["name", "logoPath", 1, "form-control", 3, "ngModelChange", "ngModel"], [1, "mb-3", "d-flex", "align-items-center", "gap-3"], [4, "ngIf"], [1, "text-muted"], ["name", "numeroRc", "placeholder", "RC-XXXX", 1, "form-control", 3, "ngModelChange", "ngModel"], ["name", "numeroIfu", "placeholder", "IFU-XXXX", 1, "form-control", 3, "ngModelChange", "ngModel"], ["name", "ville", 1, "form-control", 3, "ngModelChange", "ngModel"], ["name", "pays", 1, "form-control", 3, "ngModelChange", "ngModel"], [1, "mb-4"], [1, "d-flex", "align-items-center", "justify-content-between"], [1, "mb-1"], [1, "form-check", "form-switch"], ["type", "checkbox", "id", "darkModeToggle", "name", "darkMode", 1, "form-check-input", 3, "ngModelChange", "change", "ngModel"], ["for", "darkModeToggle", 1, "form-check-label"], [1, "fas"], [1, "text-muted", "d-block", "mb-3"], [1, "color-palette"], ["class", "color-option", 3, "active", "click", 4, "ngFor", "ngForOf"], [1, "mt-3", "p-3", "border", "rounded"], [1, "d-flex", "align-items-center", "gap-2"], [1, "preview-circle"], [1, "d-flex", "gap-2", "justify-content-end"], ["type", "submit", 1, "btn", "btn-primary", 3, "disabled"], [1, "fas", "fa-save", "me-2"], ["type", "button", 1, "btn", "btn-warning", 3, "click", "disabled"], [1, "fas", "fa-undo", "me-2"], ["type", "button", 1, "btn", "btn-light", 3, "click", "disabled"], [1, "fas", "fa-times", "me-2"], [1, "alert", "alert-info"], [1, "alert", "alert-danger"], [1, "alert", "alert-success"], ["alt", "logo", 2, "height", "60px", "object-fit", "contain", "border", "1px solid #eee", "padding", "4px", 3, "src"], [1, "color-option", 3, "click"], [1, "color-circle"], [1, "color-name"]], template: function BoutiqueSettingsComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "h5", 3);
        \u0275\u0275text(4, "Param\xE8tres de la boutique");
        \u0275\u0275elementEnd();
        \u0275\u0275template(5, BoutiqueSettingsComponent_div_5_Template, 2, 0, "div", 4)(6, BoutiqueSettingsComponent_div_6_Template, 2, 1, "div", 5)(7, BoutiqueSettingsComponent_div_7_Template, 2, 1, "div", 6);
        \u0275\u0275elementStart(8, "form", 7);
        \u0275\u0275listener("ngSubmit", function BoutiqueSettingsComponent_Template_form_ngSubmit_8_listener() {
          return ctx.save();
        });
        \u0275\u0275elementStart(9, "div", 8)(10, "h6", 9);
        \u0275\u0275text(11, "Informations g\xE9n\xE9rales");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(12, "div", 10)(13, "div", 11)(14, "label", 12);
        \u0275\u0275text(15, "Nom");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(16, "input", 13);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_16_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.nom, $event) || (ctx.model.nom = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(17, "div", 11)(18, "label", 12);
        \u0275\u0275text(19, "T\xE9l\xE9phone");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(20, "input", 14);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_20_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.telephone, $event) || (ctx.model.telephone = $event);
          return $event;
        });
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(21, "div", 10)(22, "div", 11)(23, "label", 12);
        \u0275\u0275text(24, "Email");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(25, "input", 15);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_25_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.email, $event) || (ctx.model.email = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(26, "div", 11)(27, "label", 12);
        \u0275\u0275text(28, "Adresse");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(29, "input", 16);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_29_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.adresse, $event) || (ctx.model.adresse = $event);
          return $event;
        });
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(30, "div", 17)(31, "label", 12);
        \u0275\u0275text(32, "Chemin du logo (ex: assets/images/logo.png)");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(33, "input", 18);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_33_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.logoPath, $event) || (ctx.model.logoPath = $event);
          return $event;
        });
        \u0275\u0275listener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_33_listener() {
          return ctx.onLogoChange();
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(34, "div", 19);
        \u0275\u0275template(35, BoutiqueSettingsComponent_div_35_Template, 2, 1, "div", 20);
        \u0275\u0275elementStart(36, "div", 21);
        \u0275\u0275text(37, "Pr\xE9visualisation du logo");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(38, "div", 10)(39, "div", 11)(40, "label", 12);
        \u0275\u0275text(41, "Num\xE9ro RC");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(42, "input", 22);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_42_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.numeroRc, $event) || (ctx.model.numeroRc = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(43, "div", 11)(44, "label", 12);
        \u0275\u0275text(45, "Num\xE9ro IFU");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(46, "input", 23);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_46_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.numeroIfu, $event) || (ctx.model.numeroIfu = $event);
          return $event;
        });
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(47, "div", 10)(48, "div", 11)(49, "label", 12);
        \u0275\u0275text(50, "Ville");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(51, "input", 24);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_51_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.ville, $event) || (ctx.model.ville = $event);
          return $event;
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(52, "div", 11)(53, "label", 12);
        \u0275\u0275text(54, "Pays");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(55, "input", 25);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_55_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.model.pays, $event) || (ctx.model.pays = $event);
          return $event;
        });
        \u0275\u0275elementEnd()()()();
        \u0275\u0275elementStart(56, "div", 8)(57, "h6", 9);
        \u0275\u0275text(58, "Personnalisation globale");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(59, "div", 26)(60, "div", 27)(61, "div")(62, "h6", 28);
        \u0275\u0275text(63, "Mode sombre");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(64, "small", 21);
        \u0275\u0275text(65, "Activer le th\xE8me sombre pour toute l'application");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(66, "div", 29)(67, "input", 30);
        \u0275\u0275twoWayListener("ngModelChange", function BoutiqueSettingsComponent_Template_input_ngModelChange_67_listener($event) {
          \u0275\u0275twoWayBindingSet(ctx.isDarkMode, $event) || (ctx.isDarkMode = $event);
          return $event;
        });
        \u0275\u0275listener("change", function BoutiqueSettingsComponent_Template_input_change_67_listener() {
          return ctx.toggleDarkMode();
        });
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(68, "label", 31);
        \u0275\u0275element(69, "i", 32);
        \u0275\u0275elementEnd()()()();
        \u0275\u0275elementStart(70, "div", 17)(71, "h6", 17);
        \u0275\u0275text(72, "Couleur principale");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(73, "small", 33);
        \u0275\u0275text(74, "Choisissez la couleur principale qui sera appliqu\xE9e \xE0 toute l'application");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(75, "div", 34);
        \u0275\u0275template(76, BoutiqueSettingsComponent_div_76_Template, 4, 5, "div", 35);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(77, "div", 36)(78, "div", 37);
        \u0275\u0275element(79, "div", 38);
        \u0275\u0275elementStart(80, "span");
        \u0275\u0275text(81);
        \u0275\u0275elementEnd()()()()();
        \u0275\u0275elementStart(82, "div", 39)(83, "button", 40);
        \u0275\u0275element(84, "i", 41);
        \u0275\u0275text(85);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(86, "button", 42);
        \u0275\u0275listener("click", function BoutiqueSettingsComponent_Template_button_click_86_listener() {
          return ctx.resetDefaults();
        });
        \u0275\u0275element(87, "i", 43);
        \u0275\u0275text(88, "R\xE9initialiser ");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(89, "button", 44);
        \u0275\u0275listener("click", function BoutiqueSettingsComponent_Template_button_click_89_listener() {
          return ctx.cancel();
        });
        \u0275\u0275element(90, "i", 45);
        \u0275\u0275text(91, "Annuler ");
        \u0275\u0275elementEnd()()()()()();
      }
      if (rf & 2) {
        \u0275\u0275advance(5);
        \u0275\u0275property("ngIf", ctx.isLoading);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.errorMessage);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.successMessage);
        \u0275\u0275advance(9);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.nom);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.telephone);
        \u0275\u0275advance(5);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.email);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.adresse);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.logoPath);
        \u0275\u0275advance(2);
        \u0275\u0275property("ngIf", ctx.previewLogo);
        \u0275\u0275advance(7);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.numeroRc);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.numeroIfu);
        \u0275\u0275advance(5);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.ville);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.model.pays);
        \u0275\u0275advance(12);
        \u0275\u0275twoWayProperty("ngModel", ctx.isDarkMode);
        \u0275\u0275advance(2);
        \u0275\u0275classProp("fa-moon", !ctx.isDarkMode)("fa-sun", ctx.isDarkMode);
        \u0275\u0275advance(7);
        \u0275\u0275property("ngForOf", ctx.colorPalette);
        \u0275\u0275advance();
        \u0275\u0275styleProp("background-color", ctx.selectedGlobalColor + "20");
        \u0275\u0275advance(2);
        \u0275\u0275styleProp("background-color", ctx.selectedGlobalColor);
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate1("Aper\xE7u : ", ctx.selectedGlobalColor, "");
        \u0275\u0275advance(2);
        \u0275\u0275property("disabled", ctx.isSaving || ctx.isLoading);
        \u0275\u0275advance(2);
        \u0275\u0275textInterpolate1("", ctx.isSaving ? "Enregistrement..." : "Enregistrer", " ");
        \u0275\u0275advance();
        \u0275\u0275property("disabled", ctx.isSaving || ctx.isLoading);
        \u0275\u0275advance(3);
        \u0275\u0275property("disabled", ctx.isSaving);
      }
    }, dependencies: [CommonModule, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, DefaultValueAccessor, CheckboxControlValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, NgModel, NgForm], styles: ['@charset "UTF-8";\n\n\n\n.card[_ngcontent-%COMP%] {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);\n  border: none;\n  border-radius: 16px;\n}\n.section[_ngcontent-%COMP%] {\n  padding: 24px;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  background: var(--surface);\n}\n.section-title[_ngcontent-%COMP%] {\n  color: var(--text);\n  font-weight: 600;\n  margin-bottom: 20px;\n  padding-bottom: 12px;\n  border-bottom: 2px solid var(--primary);\n  display: inline-block;\n}\n.color-palette[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  gap: 12px;\n  margin-bottom: 16px;\n}\n.color-option[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px;\n  border: 2px solid transparent;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  background: var(--surface);\n}\n.color-option[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n.color-option.active[_ngcontent-%COMP%] {\n  border-color: var(--primary);\n  background: var(--primary-soft);\n}\n.color-circle[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  border: 3px solid rgba(255, 255, 255, 0.8);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n}\n.color-name[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--text);\n}\n.preview-circle[_ngcontent-%COMP%] {\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.8);\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);\n}\n.form-check-input[_ngcontent-%COMP%]:checked {\n  background-color: var(--primary);\n  border-color: var(--primary);\n}\n.form-check-label[_ngcontent-%COMP%]   .fas[_ngcontent-%COMP%] {\n  font-size: 1.2rem;\n  color: var(--primary);\n}\n.btn[_ngcontent-%COMP%] {\n  border-radius: 8px;\n  font-weight: 500;\n  padding: 10px 20px;\n  transition: all 0.3s ease;\n}\n.btn.btn-primary[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      var(--primary) 0%,\n      var(--primary) 100%);\n  border: none;\n}\n.btn.btn-primary[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);\n}\n.btn.btn-warning[_ngcontent-%COMP%] {\n  background: #f59e0b;\n  border: none;\n}\n.btn.btn-warning[_ngcontent-%COMP%]:hover {\n  background: #d97706;\n  transform: translateY(-1px);\n}\n.btn.btn-light[_ngcontent-%COMP%] {\n  border: 1px solid var(--border);\n}\n.btn.btn-light[_ngcontent-%COMP%]:hover {\n  background: var(--surface-strong);\n}\n@media (max-width: 768px) {\n  .section[_ngcontent-%COMP%] {\n    padding: 16px;\n  }\n  .color-palette[_ngcontent-%COMP%] {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  .color-option[_ngcontent-%COMP%] {\n    flex-direction: column;\n    text-align: center;\n    gap: 8px;\n  }\n}\n.dark-mode[_ngcontent-%COMP%]   .section[_ngcontent-%COMP%] {\n  background: #1f2937;\n  border-color: #374151;\n}\n.dark-mode[_ngcontent-%COMP%]   .section-title[_ngcontent-%COMP%] {\n  color: #f9fafb;\n}\n.dark-mode[_ngcontent-%COMP%]   .color-option[_ngcontent-%COMP%] {\n  background: #374151;\n}\n.dark-mode[_ngcontent-%COMP%]   .color-option.active[_ngcontent-%COMP%] {\n  background: rgba(42, 99, 255, 0.1);\n}\n.dark-mode[_ngcontent-%COMP%]   .color-name[_ngcontent-%COMP%] {\n  color: #f9fafb;\n}\n/*# sourceMappingURL=boutique-settings.component.css.map */'] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BoutiqueSettingsComponent, [{
    type: Component,
    args: [{ selector: "app-boutique-settings", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="container py-4">\r
  <div class="card mx-auto" style="max-width: 800px;">\r
    <div class="card-body">\r
      <h5 class="card-title mb-4">Param\xE8tres de la boutique</h5>\r
\r
      <div *ngIf="isLoading" class="alert alert-info">
        Chargement des informations de la boutique ID 1...
      </div>

      <div *ngIf="errorMessage" class="alert alert-danger">
        {{ errorMessage }}
      </div>

      <div *ngIf="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <form (ngSubmit)="save()">
        <!-- Informations de base de la boutique -->\r
        <div class="section mb-4">\r
          <h6 class="section-title">Informations g\xE9n\xE9rales</h6>\r
\r
          <div class="row">\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Nom</label>\r
              <input class="form-control" [(ngModel)]="model.nom" name="nom" required>\r
            </div>\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">T\xE9l\xE9phone</label>\r
              <input class="form-control" [(ngModel)]="model.telephone" name="telephone">\r
            </div>\r
          </div>\r
\r
          <div class="row">\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Email</label>\r
              <input class="form-control" [(ngModel)]="model.email" name="email" type="email">\r
            </div>\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Adresse</label>\r
              <input class="form-control" [(ngModel)]="model.adresse" name="adresse">\r
            </div>\r
          </div>\r
\r
          <div class="mb-3">\r
            <label class="form-label">Chemin du logo (ex: assets/images/logo.png)</label>\r
            <input class="form-control" [(ngModel)]="model.logoPath" name="logoPath" (ngModelChange)="onLogoChange()">\r
          </div>\r
\r
          <div class="mb-3 d-flex align-items-center gap-3">\r
            <div *ngIf="previewLogo">\r
              <img [src]="previewLogo" alt="logo" style="height:60px; object-fit:contain; border:1px solid #eee; padding:4px;">\r
            </div>\r
            <div class="text-muted">Pr\xE9visualisation du logo</div>\r
          </div>\r
\r
          <div class="row">\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Num\xE9ro RC</label>\r
              <input class="form-control" [(ngModel)]="model.numeroRc" name="numeroRc" placeholder="RC-XXXX">\r
            </div>\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Num\xE9ro IFU</label>\r
              <input class="form-control" [(ngModel)]="model.numeroIfu" name="numeroIfu" placeholder="IFU-XXXX">\r
            </div>\r
          </div>\r
\r
          <div class="row">\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Ville</label>\r
              <input class="form-control" [(ngModel)]="model.ville" name="ville">\r
            </div>\r
            <div class="col-md-6 mb-3">\r
              <label class="form-label">Pays</label>\r
              <input class="form-control" [(ngModel)]="model.pays" name="pays">\r
            </div>\r
          </div>\r
        </div>\r
\r
        <!-- Personnalisation globale -->\r
        <div class="section mb-4">\r
          <h6 class="section-title">Personnalisation globale</h6>\r
\r
          <!-- Mode sombre -->\r
          <div class="mb-4">\r
            <div class="d-flex align-items-center justify-content-between">\r
              <div>\r
                <h6 class="mb-1">Mode sombre</h6>\r
                <small class="text-muted">Activer le th\xE8me sombre pour toute l'application</small>\r
              </div>\r
              <div class="form-check form-switch">\r
                <input class="form-check-input" type="checkbox"\r
                       id="darkModeToggle" [(ngModel)]="isDarkMode"\r
                       name="darkMode" (change)="toggleDarkMode()">\r
                <label class="form-check-label" for="darkModeToggle">\r
                  <i class="fas" [class.fa-moon]="!isDarkMode" [class.fa-sun]="isDarkMode"></i>\r
                </label>\r
              </div>\r
            </div>\r
          </div>\r
\r
          <!-- Couleur globale -->\r
          <div class="mb-3">\r
            <h6 class="mb-3">Couleur principale</h6>\r
            <small class="text-muted d-block mb-3">Choisissez la couleur principale qui sera appliqu\xE9e \xE0 toute l'application</small>\r
\r
            <div class="color-palette">\r
              <div class="color-option"\r
                   *ngFor="let color of colorPalette"\r
                   [class.active]="selectedGlobalColor === color.value"\r
                   (click)="changeGlobalColor(color.value)">\r
                <div class="color-circle" [style.background-color]="color.value"></div>\r
                <span class="color-name">{{ color.name }}</span>\r
              </div>\r
            </div>\r
\r
            <!-- Aper\xE7u de la couleur s\xE9lectionn\xE9e -->\r
            <div class="mt-3 p-3 border rounded" [style.background-color]="selectedGlobalColor + '20'">\r
              <div class="d-flex align-items-center gap-2">\r
                <div class="preview-circle" [style.background-color]="selectedGlobalColor"></div>\r
                <span>Aper\xE7u : {{ selectedGlobalColor }}</span>\r
              </div>\r
            </div>\r
          </div>\r
        </div>\r
\r
        <!-- Boutons d'action -->\r
        <div class="d-flex gap-2 justify-content-end">\r
          <button class="btn btn-primary" type="submit" [disabled]="isSaving || isLoading">
            <i class="fas fa-save me-2"></i>{{ isSaving ? 'Enregistrement...' : 'Enregistrer' }}
          </button>\r
          <button class="btn btn-warning" type="button" (click)="resetDefaults()" [disabled]="isSaving || isLoading">
            <i class="fas fa-undo me-2"></i>R\xE9initialiser\r
          </button>\r
          <button class="btn btn-light" type="button" (click)="cancel()" [disabled]="isSaving">
            <i class="fas fa-times me-2"></i>Annuler\r
          </button>\r
        </div>\r
      </form>\r
    </div>\r
  </div>\r
</div>\r
`, styles: ['@charset "UTF-8";\n\n/* src/app/views/pages/boutiques/boutique-settings.component.scss */\n.card {\n  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);\n  border: none;\n  border-radius: 16px;\n}\n.section {\n  padding: 24px;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n  background: var(--surface);\n}\n.section-title {\n  color: var(--text);\n  font-weight: 600;\n  margin-bottom: 20px;\n  padding-bottom: 12px;\n  border-bottom: 2px solid var(--primary);\n  display: inline-block;\n}\n.color-palette {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));\n  gap: 12px;\n  margin-bottom: 16px;\n}\n.color-option {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  padding: 12px;\n  border: 2px solid transparent;\n  border-radius: 12px;\n  cursor: pointer;\n  transition: all 0.3s ease;\n  background: var(--surface);\n}\n.color-option:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);\n}\n.color-option.active {\n  border-color: var(--primary);\n  background: var(--primary-soft);\n}\n.color-circle {\n  width: 32px;\n  height: 32px;\n  border-radius: 50%;\n  border: 3px solid rgba(255, 255, 255, 0.8);\n  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);\n}\n.color-name {\n  font-weight: 500;\n  color: var(--text);\n}\n.preview-circle {\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  border: 2px solid rgba(255, 255, 255, 0.8);\n  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);\n}\n.form-check-input:checked {\n  background-color: var(--primary);\n  border-color: var(--primary);\n}\n.form-check-label .fas {\n  font-size: 1.2rem;\n  color: var(--primary);\n}\n.btn {\n  border-radius: 8px;\n  font-weight: 500;\n  padding: 10px 20px;\n  transition: all 0.3s ease;\n}\n.btn.btn-primary {\n  background:\n    linear-gradient(\n      135deg,\n      var(--primary) 0%,\n      var(--primary) 100%);\n  border: none;\n}\n.btn.btn-primary:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);\n}\n.btn.btn-warning {\n  background: #f59e0b;\n  border: none;\n}\n.btn.btn-warning:hover {\n  background: #d97706;\n  transform: translateY(-1px);\n}\n.btn.btn-light {\n  border: 1px solid var(--border);\n}\n.btn.btn-light:hover {\n  background: var(--surface-strong);\n}\n@media (max-width: 768px) {\n  .section {\n    padding: 16px;\n  }\n  .color-palette {\n    grid-template-columns: repeat(2, 1fr);\n  }\n  .color-option {\n    flex-direction: column;\n    text-align: center;\n    gap: 8px;\n  }\n}\n.dark-mode .section {\n  background: #1f2937;\n  border-color: #374151;\n}\n.dark-mode .section-title {\n  color: #f9fafb;\n}\n.dark-mode .color-option {\n  background: #374151;\n}\n.dark-mode .color-option.active {\n  background: rgba(42, 99, 255, 0.1);\n}\n.dark-mode .color-name {\n  color: #f9fafb;\n}\n/*# sourceMappingURL=boutique-settings.component.css.map */\n'] }]
  }], () => [{ type: BoutiqueService }, { type: Router }, { type: Renderer2 }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(BoutiqueSettingsComponent, { className: "BoutiqueSettingsComponent", filePath: "src/app/views/pages/boutiques/boutique-settings.component.ts", lineNumber: 14 });
})();

export {
  BoutiqueSettingsComponent
};
//# sourceMappingURL=chunk-3VCOVUNC.js.map
