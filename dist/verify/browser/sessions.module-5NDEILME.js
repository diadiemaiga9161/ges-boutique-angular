import {
  SharedComponentsModule
} from "./chunk-CZ22ESCR.js";
import {
  UserService
} from "./chunk-VQUZDUTW.js";
import "./chunk-JEGG35UW.js";
import {
  AuthService,
  BoutiqueService,
  CommonModule,
  Component,
  DefaultValueAccessor,
  FormsModule,
  MinLengthValidator,
  NgClass,
  NgControlStatus,
  NgControlStatusGroup,
  NgForm,
  NgIf,
  NgModel,
  NgModule,
  NgSelectOption,
  PatternValidator,
  ReactiveFormsModule,
  RequiredValidator,
  Router,
  RouterModule,
  SelectControlValueAccessor,
  setClassMetadata,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵpureFunction2,
  ɵɵreference,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-RK5GU4B7.js";
import "./chunk-TXDUYLVM.js";

// src/app/views/sessions/inscription/inscription.component.ts
function InscriptionComponent_div_9_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 37);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classProp("success", !ctx_r1.isError)("error", ctx_r1.isError);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.message, " ");
  }
}
function InscriptionComponent_option_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 38);
    \u0275\u0275text(1, "Administrateur");
    \u0275\u0275elementEnd();
  }
}
function InscriptionComponent_small_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "small", 35);
    \u0275\u0275text(1, " Seuls les administrateurs peuvent cr\xE9er des comptes admin ");
    \u0275\u0275elementEnd();
  }
}
function InscriptionComponent_div_38_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 39)(1, "div", 40)(2, "div", 41);
    \u0275\u0275element(3, "div", 42)(4, "div", 42)(5, "div", 42)(6, "div", 42);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(7, "small", 43);
    \u0275\u0275text(8);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(9, "small", 31);
    \u0275\u0275text(10, " Minimum 6 caract\xE8res avec majuscules, minuscules et chiffres ");
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275classProp("active", ctx_r1.passwordStrength >= 1);
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.passwordStrength >= 2);
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.passwordStrength >= 3);
    \u0275\u0275advance();
    \u0275\u0275classProp("active", ctx_r1.passwordStrength >= 4);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(ctx_r1.passwordStrengthText);
  }
}
function InscriptionComponent_span_62_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275element(1, "i", 44);
    \u0275\u0275text(2, " Cr\xE9er le compte ");
    \u0275\u0275elementEnd();
  }
}
function InscriptionComponent_span_63_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275element(1, "i", 45);
    \u0275\u0275text(2, " Cr\xE9ation... ");
    \u0275\u0275elementEnd();
  }
}
var InscriptionComponent = class _InscriptionComponent {
  constructor(userService, authService, router) {
    this.userService = userService;
    this.authService = authService;
    this.router = router;
    this.username = "";
    this.password = "";
    this.confirmPassword = "";
    this.nomComplet = "";
    this.email = "";
    this.telephone = "";
    this.role = "VENDEUR";
    this.isLoading = false;
    this.message = "";
    this.isError = false;
    this.showPassword = false;
    this.passwordStrength = 0;
    this.passwordStrengthText = "";
  }
  ngOnInit() {
    if (!this.authService.isAuthenticated() || !this.authService.isAdmin()) {
      this.message = "Acc\xE8s refus\xE9. Seuls les administrateurs peuvent cr\xE9er des comptes.";
      this.isError = true;
    }
  }
  register() {
    if (!this.validateForm()) {
      return;
    }
    const userData = {
      username: this.username,
      password: this.password,
      nomComplet: this.nomComplet,
      email: this.email,
      telephone: this.telephone,
      role: this.role
    };
    this.isLoading = true;
    this.message = "Cr\xE9ation du compte en cours...";
    this.isError = false;
    const token = this.authService.getToken();
    if (token) {
      this.userService.createUser(userData, token).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.showMessage("Utilisateur cr\xE9\xE9 avec succ\xE8s !", false);
          this.resetForm();
        },
        error: (error) => {
          this.isLoading = false;
          this.showMessage(error.message || "Erreur lors de la cr\xE9ation du compte", true);
        }
      });
    } else {
      this.isLoading = false;
      this.showMessage("Token d'authentification manquant", true);
    }
  }
  validateForm() {
    if (!this.username.trim()) {
      this.showMessage("Le nom d'utilisateur est obligatoire", true);
      return false;
    }
    if (!this.password.trim()) {
      this.showMessage("Le mot de passe est obligatoire", true);
      return false;
    }
    if (this.password !== this.confirmPassword) {
      this.showMessage("Les mots de passe ne correspondent pas", true);
      return false;
    }
    if (this.password.length < 6) {
      this.showMessage("Le mot de passe doit contenir au moins 6 caract\xE8res", true);
      return false;
    }
    if (!this.nomComplet.trim()) {
      this.showMessage("Le nom complet est obligatoire", true);
      return false;
    }
    if (!this.email.trim()) {
      this.showMessage("L'email est obligatoire", true);
      return false;
    }
    if (!this.validateEmail(this.email)) {
      this.showMessage("Veuillez saisir un email valide", true);
      return false;
    }
    if (!this.telephone.trim()) {
      this.showMessage("Le t\xE9l\xE9phone est obligatoire", true);
      return false;
    }
    if (!this.validatePhone(this.telephone)) {
      this.showMessage("Veuillez saisir un num\xE9ro de t\xE9l\xE9phone valide (10 chiffres)", true);
      return false;
    }
    return true;
  }
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  validatePhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
  }
  checkPasswordStrength() {
    let strength = 0;
    let text = "";
    if (this.password.length >= 8)
      strength += 1;
    if (/[A-Z]/.test(this.password))
      strength += 1;
    if (/[0-9]/.test(this.password))
      strength += 1;
    if (/[^A-Za-z0-9]/.test(this.password))
      strength += 1;
    this.passwordStrength = strength;
    switch (strength) {
      case 0:
      case 1:
        text = "Faible";
        break;
      case 2:
        text = "Moyen";
        break;
      case 3:
        text = "Bon";
        break;
      case 4:
        text = "Tr\xE8s bon";
        break;
    }
    this.passwordStrengthText = text;
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  showMessage(message, isError = false) {
    this.message = message;
    this.isError = isError;
    if (!isError) {
      setTimeout(() => {
        this.message = "";
      }, 5e3);
    }
  }
  resetForm() {
    this.username = "";
    this.password = "";
    this.confirmPassword = "";
    this.nomComplet = "";
    this.email = "";
    this.telephone = "";
    this.role = "VENDEUR";
    this.passwordStrength = 0;
    this.passwordStrengthText = "";
    this.message = "";
  }
  goToLogin() {
    this.router.navigate(["/sessions/connexion"]);
  }
  static {
    this.\u0275fac = function InscriptionComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _InscriptionComponent)(\u0275\u0275directiveInject(UserService), \u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _InscriptionComponent, selectors: [["app-inscription"]], decls: 70, vars: 26, consts: [["f", "ngForm"], [1, "auth-bg"], [1, "form-wrapper"], [1, "card", "auth-card"], [1, "form-title"], [1, "registration"], ["type", "button", 3, "click"], ["class", "alert-message", 3, "success", "error", 4, "ngIf"], [3, "ngSubmit"], [1, "section-title"], [1, "fa", "fa-user"], [1, "row", "g-2", "mb-3"], [1, "col-md-6"], [1, "form-label"], ["type", "text", "name", "username", "required", "", "placeholder", "john.doe", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], ["name", "role", "required", "", 1, "form-select", 3, "ngModelChange", "ngModel", "disabled"], ["value", "VENDEUR"], ["value", "ADMIN", 4, "ngIf"], ["class", "text-muted", 4, "ngIf"], [1, "fa", "fa-lock"], [1, "mb-3"], [1, "input-group"], ["name", "password", "required", "", "minlength", "6", "placeholder", "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF", 1, "form-control", 3, "ngModelChange", "input", "type", "ngModel", "disabled"], ["type", "button", 1, "btn", "btn-outline-secondary", 3, "click"], [1, "fa"], ["class", "mt-2", 4, "ngIf"], ["type", "password", "name", "confirmPassword", "required", "", "placeholder", "\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], [1, "fa", "fa-id-card"], ["type", "text", "name", "nomComplet", "required", "", "placeholder", "John Doe", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], ["type", "email", "name", "email", "required", "", "placeholder", "john@example.com", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], ["type", "tel", "name", "telephone", "required", "", "pattern", "[0-9]{10}", "placeholder", "0123456789", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], [1, "form-text", "text-muted"], ["type", "submit", 1, "btn", "btn-primary", "btn-block", "mt-4", 3, "disabled"], [4, "ngIf"], [1, "mt-4", "p-3", "bg-light", "rounded"], [1, "text-muted"], [1, "fa", "fa-info-circle", "me-1"], [1, "alert-message"], ["value", "ADMIN"], [1, "mt-2"], [1, "password-strength"], [1, "strength-bars"], [1, "bar"], [1, "strength-text"], [1, "fa", "fa-user-plus", "me-1"], [1, "fa", "fa-spinner", "fa-spin", "me-1"]], template: function InscriptionComponent_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = \u0275\u0275getCurrentView();
        \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "h3", 4);
        \u0275\u0275text(4, "Cr\xE9er un compte");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(5, "div", 5);
        \u0275\u0275text(6, " D\xE9j\xE0 un compte ? ");
        \u0275\u0275elementStart(7, "button", 6);
        \u0275\u0275listener("click", function InscriptionComponent_Template_button_click_7_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.goToLogin());
        });
        \u0275\u0275text(8, "Connectez-vous ici");
        \u0275\u0275elementEnd()();
        \u0275\u0275template(9, InscriptionComponent_div_9_Template, 2, 5, "div", 7);
        \u0275\u0275elementStart(10, "form", 8, 0);
        \u0275\u0275listener("ngSubmit", function InscriptionComponent_Template_form_ngSubmit_10_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.register());
        });
        \u0275\u0275elementStart(12, "div", 9);
        \u0275\u0275element(13, "i", 10);
        \u0275\u0275text(14, " Informations de connexion ");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(15, "div", 11)(16, "div", 12)(17, "label", 13);
        \u0275\u0275text(18, "Nom d'utilisateur *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(19, "input", 14);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_input_ngModelChange_19_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.username, $event) || (ctx.username = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(20, "div", 12)(21, "label", 13);
        \u0275\u0275text(22, "R\xF4le *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(23, "select", 15);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_select_ngModelChange_23_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.role, $event) || (ctx.role = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementStart(24, "option", 16);
        \u0275\u0275text(25, "Vendeur");
        \u0275\u0275elementEnd();
        \u0275\u0275template(26, InscriptionComponent_option_26_Template, 2, 0, "option", 17);
        \u0275\u0275elementEnd();
        \u0275\u0275template(27, InscriptionComponent_small_27_Template, 2, 0, "small", 18);
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(28, "div", 9);
        \u0275\u0275element(29, "i", 19);
        \u0275\u0275text(30, " Mot de passe ");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(31, "div", 20)(32, "label", 13);
        \u0275\u0275text(33, "Mot de passe *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(34, "div", 21)(35, "input", 22);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_input_ngModelChange_35_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.password, $event) || (ctx.password = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275listener("input", function InscriptionComponent_Template_input_input_35_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.checkPasswordStrength());
        });
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(36, "button", 23);
        \u0275\u0275listener("click", function InscriptionComponent_Template_button_click_36_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.togglePasswordVisibility());
        });
        \u0275\u0275element(37, "i", 24);
        \u0275\u0275elementEnd()();
        \u0275\u0275template(38, InscriptionComponent_div_38_Template, 11, 9, "div", 25);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(39, "div", 20)(40, "label", 13);
        \u0275\u0275text(41, "Confirmer le mot de passe *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(42, "input", 26);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_input_ngModelChange_42_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.confirmPassword, $event) || (ctx.confirmPassword = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(43, "div", 9);
        \u0275\u0275element(44, "i", 27);
        \u0275\u0275text(45, " Informations personnelles ");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(46, "div", 20)(47, "label", 13);
        \u0275\u0275text(48, "Nom complet *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(49, "input", 28);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_input_ngModelChange_49_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.nomComplet, $event) || (ctx.nomComplet = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(50, "div", 11)(51, "div", 12)(52, "label", 13);
        \u0275\u0275text(53, "Email *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(54, "input", 29);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_input_ngModelChange_54_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.email, $event) || (ctx.email = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(55, "div", 12)(56, "label", 13);
        \u0275\u0275text(57, "T\xE9l\xE9phone *");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(58, "input", 30);
        \u0275\u0275twoWayListener("ngModelChange", function InscriptionComponent_Template_input_ngModelChange_58_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.telephone, $event) || (ctx.telephone = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(59, "small", 31);
        \u0275\u0275text(60, "10 chiffres");
        \u0275\u0275elementEnd()()();
        \u0275\u0275elementStart(61, "button", 32);
        \u0275\u0275template(62, InscriptionComponent_span_62_Template, 3, 0, "span", 33)(63, InscriptionComponent_span_63_Template, 3, 0, "span", 33);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(64, "div", 34)(65, "small", 35);
        \u0275\u0275element(66, "i", 36);
        \u0275\u0275elementStart(67, "strong");
        \u0275\u0275text(68, "Note:");
        \u0275\u0275elementEnd();
        \u0275\u0275text(69, " L'inscription publique n'est pas disponible. Seuls les administrateurs connect\xE9s peuvent cr\xE9er des comptes utilisateurs. Si vous n'avez pas acc\xE8s, contactez votre administrateur. ");
        \u0275\u0275elementEnd()()()()()();
      }
      if (rf & 2) {
        const f_r3 = \u0275\u0275reference(11);
        \u0275\u0275advance(9);
        \u0275\u0275property("ngIf", ctx.message);
        \u0275\u0275advance(10);
        \u0275\u0275twoWayProperty("ngModel", ctx.username);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.role);
        \u0275\u0275property("disabled", ctx.isLoading || !ctx.authService.isAdmin());
        \u0275\u0275advance(3);
        \u0275\u0275property("ngIf", ctx.authService.isAdmin());
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.authService.isAdmin());
        \u0275\u0275advance(8);
        \u0275\u0275property("type", ctx.showPassword ? "text" : "password");
        \u0275\u0275twoWayProperty("ngModel", ctx.password);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(2);
        \u0275\u0275classProp("fa-eye", !ctx.showPassword)("fa-eye-slash", ctx.showPassword);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.password);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.confirmPassword);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(7);
        \u0275\u0275twoWayProperty("ngModel", ctx.nomComplet);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(5);
        \u0275\u0275twoWayProperty("ngModel", ctx.email);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(4);
        \u0275\u0275twoWayProperty("ngModel", ctx.telephone);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(3);
        \u0275\u0275property("disabled", ctx.isLoading || f_r3.invalid);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.isLoading);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.isLoading);
      }
    }, dependencies: [FormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinLengthValidator, PatternValidator, NgModel, NgForm, CommonModule, NgIf], styles: ["\n\n.auth-bg[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n}\n.form-wrapper[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 600px;\n}\n.auth-card[_ngcontent-%COMP%] {\n  background: white;\n  border-radius: 12px;\n  padding: 40px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);\n}\n.form-title[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #333;\n  margin-bottom: 30px;\n  font-weight: 700;\n  font-size: 24px;\n}\n.registration[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 30px;\n  color: #666;\n  font-size: 14px;\n}\n.registration[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #667eea;\n  cursor: pointer;\n  padding: 0;\n  font-weight: 600;\n  margin-left: 5px;\n}\n.registration[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.alert-message[_ngcontent-%COMP%] {\n  padding: 15px;\n  border-radius: 8px;\n  margin-bottom: 25px;\n  text-align: center;\n  font-weight: 500;\n  animation: _ngcontent-%COMP%_fadeIn 0.3s ease;\n}\n.alert-message.success[_ngcontent-%COMP%] {\n  background-color: #d4edda;\n  color: #155724;\n  border: 1px solid #c3e6cb;\n}\n.alert-message.error[_ngcontent-%COMP%] {\n  background-color: #f8d7da;\n  color: #721c24;\n  border: 1px solid #f5c6cb;\n}\n.section-title[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #495057;\n  margin: 25px 0 15px 0;\n  padding-bottom: 10px;\n  border-bottom: 2px solid #f0f0f0;\n  font-size: 16px;\n}\n.section-title[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  color: #667eea;\n  margin-right: 10px;\n}\n.form-label[_ngcontent-%COMP%] {\n  font-weight: 600;\n  color: #495057;\n  margin-bottom: 8px;\n  font-size: 14px;\n}\n.form-control[_ngcontent-%COMP%] {\n  border: 2px solid #e9ecef;\n  border-radius: 8px;\n  padding: 12px 15px;\n  transition: all 0.3s ease;\n  font-size: 14px;\n}\n.form-control[_ngcontent-%COMP%]:focus {\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);\n}\n.form-control[_ngcontent-%COMP%]:disabled {\n  background-color: #f8f9fa;\n  cursor: not-allowed;\n  opacity: 0.7;\n}\n.form-select[_ngcontent-%COMP%] {\n  border: 2px solid #e9ecef;\n  border-radius: 8px;\n  padding: 12px 15px;\n  transition: all 0.3s ease;\n  font-size: 14px;\n}\n.form-select[_ngcontent-%COMP%]:focus {\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);\n}\n.form-select[_ngcontent-%COMP%]:disabled {\n  background-color: #f8f9fa;\n  cursor: not-allowed;\n  opacity: 0.7;\n}\n.input-group[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%] {\n  border-right: none;\n}\n.input-group[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%] {\n  border: 2px solid #e9ecef;\n  border-left: none;\n  background: white;\n}\n.input-group[_ngcontent-%COMP%]   .btn[_ngcontent-%COMP%]:hover {\n  background-color: #f8f9fa;\n}\n.password-strength[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  flex: 1;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%]   .bar[_ngcontent-%COMP%] {\n  height: 6px;\n  flex: 1;\n  background-color: #e9ecef;\n  border-radius: 3px;\n  transition: all 0.3s ease;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%]   .bar.active[_ngcontent-%COMP%] {\n  background-color: #28a745;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%]   .bar.active[_ngcontent-%COMP%]:nth-child(1) {\n  background-color: #dc3545;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%]   .bar.active[_ngcontent-%COMP%]:nth-child(2) {\n  background-color: #ffc107;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%]   .bar.active[_ngcontent-%COMP%]:nth-child(3) {\n  background-color: #28a745;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-bars[_ngcontent-%COMP%]   .bar.active[_ngcontent-%COMP%]:nth-child(4) {\n  background-color: #20c997;\n}\n.password-strength[_ngcontent-%COMP%]   .strength-text[_ngcontent-%COMP%] {\n  font-weight: 600;\n  min-width: 70px;\n  text-align: right;\n  font-size: 12px;\n}\n.form-text[_ngcontent-%COMP%] {\n  font-size: 12px;\n  margin-top: 5px;\n  display: block;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  border: none;\n  height: 50px;\n  width: 100%;\n  font-weight: 600;\n  border-radius: 8px;\n  font-size: 16px;\n  transition: all 0.3s ease;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n  transform: none;\n  box-shadow: none;\n}\n.bg-light[_ngcontent-%COMP%] {\n  background-color: #f8f9fa !important;\n  border: 1px solid #e9ecef;\n}\n.bg-light[_ngcontent-%COMP%]   small[_ngcontent-%COMP%] {\n  line-height: 1.5;\n}\n@keyframes _ngcontent-%COMP%_fadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n@media (max-width: 768px) {\n  .auth-card[_ngcontent-%COMP%] {\n    padding: 30px 20px;\n  }\n  .form-title[_ngcontent-%COMP%] {\n    font-size: 20px;\n  }\n  .btn-primary[_ngcontent-%COMP%] {\n    height: 45px;\n    font-size: 14px;\n  }\n}\n/*# sourceMappingURL=inscription.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InscriptionComponent, [{
    type: Component,
    args: [{ selector: "app-inscription", imports: [FormsModule, CommonModule], template: `<div class="auth-bg">\r
  <div class="form-wrapper">\r
    <div class="card auth-card">\r
      <h3 class="form-title">Cr\xE9er un compte</h3>\r
\r
      <div class="registration">\r
        D\xE9j\xE0 un compte ?\r
        <button type="button" (click)="goToLogin()">Connectez-vous ici</button>\r
      </div>\r
\r
      <div *ngIf="message" class="alert-message"\r
           [class.success]="!isError"\r
           [class.error]="isError">\r
        {{ message }}\r
      </div>\r
\r
      <form (ngSubmit)="register()" #f="ngForm">\r
        <div class="section-title">\r
          <i class="fa fa-user"></i> Informations de connexion\r
        </div>\r
\r
        <div class="row g-2 mb-3">\r
          <div class="col-md-6">\r
            <label class="form-label">Nom d'utilisateur *</label>\r
            <input type="text" class="form-control"\r
                   name="username"\r
                   [(ngModel)]="username"\r
                   required\r
                   [disabled]="isLoading"\r
                   placeholder="john.doe">\r
          </div>\r
          <div class="col-md-6">\r
            <label class="form-label">R\xF4le *</label>\r
            <select class="form-select"\r
                    name="role"\r
                    [(ngModel)]="role"\r
                    required\r
                    [disabled]="isLoading || !authService.isAdmin()">\r
              <option value="VENDEUR">Vendeur</option>\r
              <option value="ADMIN" *ngIf="authService.isAdmin()">Administrateur</option>\r
            </select>\r
            <small *ngIf="!authService.isAdmin()" class="text-muted">\r
              Seuls les administrateurs peuvent cr\xE9er des comptes admin\r
            </small>\r
          </div>\r
        </div>\r
\r
        <div class="section-title">\r
          <i class="fa fa-lock"></i> Mot de passe\r
        </div>\r
\r
        <div class="mb-3">\r
          <label class="form-label">Mot de passe *</label>\r
          <div class="input-group">\r
            <input [type]="showPassword ? 'text' : 'password'"\r
                   class="form-control"\r
                   name="password"\r
                   [(ngModel)]="password"\r
                   (input)="checkPasswordStrength()"\r
                   required\r
                   minlength="6"\r
                   [disabled]="isLoading"\r
                   placeholder="\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF">\r
            <button class="btn btn-outline-secondary" type="button"\r
                    (click)="togglePasswordVisibility()">\r
              <i class="fa" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword"></i>\r
            </button>\r
          </div>\r
          \r
          <div *ngIf="password" class="mt-2">\r
            <div class="password-strength">\r
              <div class="strength-bars">\r
                <div class="bar" [class.active]="passwordStrength >= 1"></div>\r
                <div class="bar" [class.active]="passwordStrength >= 2"></div>\r
                <div class="bar" [class.active]="passwordStrength >= 3"></div>\r
                <div class="bar" [class.active]="passwordStrength >= 4"></div>\r
              </div>\r
              <small class="strength-text">{{ passwordStrengthText }}</small>\r
            </div>\r
            <small class="form-text text-muted">\r
              Minimum 6 caract\xE8res avec majuscules, minuscules et chiffres\r
            </small>\r
          </div>\r
        </div>\r
\r
        <div class="mb-3">\r
          <label class="form-label">Confirmer le mot de passe *</label>\r
          <input type="password"\r
                 class="form-control"\r
                 name="confirmPassword"\r
                 [(ngModel)]="confirmPassword"\r
                 required\r
                 [disabled]="isLoading"\r
                 placeholder="\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF\u25CF">\r
        </div>\r
\r
        <div class="section-title">\r
          <i class="fa fa-id-card"></i> Informations personnelles\r
        </div>\r
\r
        <div class="mb-3">\r
          <label class="form-label">Nom complet *</label>\r
          <input type="text"\r
                 class="form-control"\r
                 name="nomComplet"\r
                 [(ngModel)]="nomComplet"\r
                 required\r
                 [disabled]="isLoading"\r
                 placeholder="John Doe">\r
        </div>\r
\r
        <div class="row g-2 mb-3">\r
          <div class="col-md-6">\r
            <label class="form-label">Email *</label>\r
            <input type="email"\r
                   class="form-control"\r
                   name="email"\r
                   [(ngModel)]="email"\r
                   required\r
                   [disabled]="isLoading"\r
                   placeholder="john@example.com">\r
          </div>\r
          <div class="col-md-6">\r
            <label class="form-label">T\xE9l\xE9phone *</label>\r
            <input type="tel"\r
                   class="form-control"\r
                   name="telephone"\r
                   [(ngModel)]="telephone"\r
                   required\r
                   pattern="[0-9]{10}"\r
                   [disabled]="isLoading"\r
                   placeholder="0123456789">\r
            <small class="form-text text-muted">10 chiffres</small>\r
          </div>\r
        </div>\r
\r
        <button class="btn btn-primary btn-block mt-4"\r
                type="submit"\r
                [disabled]="isLoading || f.invalid">\r
          <span *ngIf="!isLoading">\r
            <i class="fa fa-user-plus me-1"></i> Cr\xE9er le compte\r
          </span>\r
          <span *ngIf="isLoading">\r
            <i class="fa fa-spinner fa-spin me-1"></i> Cr\xE9ation...\r
          </span>\r
        </button>\r
\r
        <div class="mt-4 p-3 bg-light rounded">\r
          <small class="text-muted">\r
            <i class="fa fa-info-circle me-1"></i>\r
            <strong>Note:</strong> L'inscription publique n'est pas disponible. \r
            Seuls les administrateurs connect\xE9s peuvent cr\xE9er des comptes utilisateurs.\r
            Si vous n'avez pas acc\xE8s, contactez votre administrateur.\r
          </small>\r
        </div>\r
      </form>\r
    </div>\r
  </div>\r
</div>`, styles: ["/* src/app/views/sessions/inscription/inscription.component.scss */\n.auth-bg {\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 20px;\n}\n.form-wrapper {\n  width: 100%;\n  max-width: 600px;\n}\n.auth-card {\n  background: white;\n  border-radius: 12px;\n  padding: 40px;\n  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);\n}\n.form-title {\n  text-align: center;\n  color: #333;\n  margin-bottom: 30px;\n  font-weight: 700;\n  font-size: 24px;\n}\n.registration {\n  text-align: center;\n  margin-bottom: 30px;\n  color: #666;\n  font-size: 14px;\n}\n.registration button {\n  background: none;\n  border: none;\n  color: #667eea;\n  cursor: pointer;\n  padding: 0;\n  font-weight: 600;\n  margin-left: 5px;\n}\n.registration button:hover {\n  text-decoration: underline;\n}\n.alert-message {\n  padding: 15px;\n  border-radius: 8px;\n  margin-bottom: 25px;\n  text-align: center;\n  font-weight: 500;\n  animation: fadeIn 0.3s ease;\n}\n.alert-message.success {\n  background-color: #d4edda;\n  color: #155724;\n  border: 1px solid #c3e6cb;\n}\n.alert-message.error {\n  background-color: #f8d7da;\n  color: #721c24;\n  border: 1px solid #f5c6cb;\n}\n.section-title {\n  font-weight: 600;\n  color: #495057;\n  margin: 25px 0 15px 0;\n  padding-bottom: 10px;\n  border-bottom: 2px solid #f0f0f0;\n  font-size: 16px;\n}\n.section-title i {\n  color: #667eea;\n  margin-right: 10px;\n}\n.form-label {\n  font-weight: 600;\n  color: #495057;\n  margin-bottom: 8px;\n  font-size: 14px;\n}\n.form-control {\n  border: 2px solid #e9ecef;\n  border-radius: 8px;\n  padding: 12px 15px;\n  transition: all 0.3s ease;\n  font-size: 14px;\n}\n.form-control:focus {\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);\n}\n.form-control:disabled {\n  background-color: #f8f9fa;\n  cursor: not-allowed;\n  opacity: 0.7;\n}\n.form-select {\n  border: 2px solid #e9ecef;\n  border-radius: 8px;\n  padding: 12px 15px;\n  transition: all 0.3s ease;\n  font-size: 14px;\n}\n.form-select:focus {\n  border-color: #667eea;\n  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);\n}\n.form-select:disabled {\n  background-color: #f8f9fa;\n  cursor: not-allowed;\n  opacity: 0.7;\n}\n.input-group .form-control {\n  border-right: none;\n}\n.input-group .btn {\n  border: 2px solid #e9ecef;\n  border-left: none;\n  background: white;\n}\n.input-group .btn:hover {\n  background-color: #f8f9fa;\n}\n.password-strength {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n}\n.password-strength .strength-bars {\n  display: flex;\n  gap: 4px;\n  flex: 1;\n}\n.password-strength .strength-bars .bar {\n  height: 6px;\n  flex: 1;\n  background-color: #e9ecef;\n  border-radius: 3px;\n  transition: all 0.3s ease;\n}\n.password-strength .strength-bars .bar.active {\n  background-color: #28a745;\n}\n.password-strength .strength-bars .bar.active:nth-child(1) {\n  background-color: #dc3545;\n}\n.password-strength .strength-bars .bar.active:nth-child(2) {\n  background-color: #ffc107;\n}\n.password-strength .strength-bars .bar.active:nth-child(3) {\n  background-color: #28a745;\n}\n.password-strength .strength-bars .bar.active:nth-child(4) {\n  background-color: #20c997;\n}\n.password-strength .strength-text {\n  font-weight: 600;\n  min-width: 70px;\n  text-align: right;\n  font-size: 12px;\n}\n.form-text {\n  font-size: 12px;\n  margin-top: 5px;\n  display: block;\n}\n.btn-primary {\n  background:\n    linear-gradient(\n      135deg,\n      #667eea 0%,\n      #764ba2 100%);\n  border: none;\n  height: 50px;\n  width: 100%;\n  font-weight: 600;\n  border-radius: 8px;\n  font-size: 16px;\n  transition: all 0.3s ease;\n}\n.btn-primary:hover {\n  transform: translateY(-2px);\n  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);\n}\n.btn-primary:disabled {\n  opacity: 0.6;\n  cursor: not-allowed;\n  transform: none;\n  box-shadow: none;\n}\n.bg-light {\n  background-color: #f8f9fa !important;\n  border: 1px solid #e9ecef;\n}\n.bg-light small {\n  line-height: 1.5;\n}\n@keyframes fadeIn {\n  from {\n    opacity: 0;\n    transform: translateY(-10px);\n  }\n  to {\n    opacity: 1;\n    transform: translateY(0);\n  }\n}\n@media (max-width: 768px) {\n  .auth-card {\n    padding: 30px 20px;\n  }\n  .form-title {\n    font-size: 20px;\n  }\n  .btn-primary {\n    height: 45px;\n    font-size: 14px;\n  }\n}\n/*# sourceMappingURL=inscription.component.css.map */\n"] }]
  }], () => [{ type: UserService }, { type: AuthService }, { type: Router }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(InscriptionComponent, { className: "InscriptionComponent", filePath: "src/app/views/sessions/inscription/inscription.component.ts", lineNumber: 14 });
})();

// src/app/views/sessions/connexion/connexion.component.ts
var _c0 = (a0, a1) => ({ success: a0, error: a1 });
function ConnexionComponent_div_11_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction2(2, _c0, !ctx_r1.isError, ctx_r1.isError));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.message, " ");
  }
}
function ConnexionComponent_span_27_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Se connecter");
    \u0275\u0275elementEnd();
  }
}
function ConnexionComponent_span_28_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275element(1, "i", 20);
    \u0275\u0275text(2, " Connexion... ");
    \u0275\u0275elementEnd();
  }
}
function ConnexionComponent_div_29_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 21)(1, "small", 22);
    \u0275\u0275element(2, "i", 23);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(3);
    \u0275\u0275textInterpolate1(" D\xE9j\xE0 connect\xE9 en tant que: ", ctx_r1.authService.getDisplayName(), " ");
  }
}
var ConnexionComponent = class _ConnexionComponent {
  constructor(authService, router, boutiqueService) {
    this.authService = authService;
    this.router = router;
    this.boutiqueService = boutiqueService;
    this.username = "";
    this.password = "";
    this.isLoading = false;
    this.message = "";
    this.isError = false;
    this.boutiqueName = "";
  }
  ngOnInit() {
    this.boutiqueName = this.boutiqueService.getInfo().nom || "Boutique";
  }
  login() {
    if (!this.username.trim()) {
      this.showMessage("Veuillez saisir votre nom d'utilisateur", true);
      return;
    }
    if (!this.password.trim()) {
      this.showMessage("Veuillez saisir votre mot de passe", true);
      return;
    }
    const credentials = {
      username: this.username.trim(),
      password: this.password
    };
    this.isLoading = true;
    this.message = "Connexion en cours...";
    this.isError = false;
    this.authService.signin(credentials).subscribe({
      next: () => {
        this.isLoading = false;
        this.showMessage("Connexion r\xE9ussie ! Redirection...", false);
        setTimeout(() => {
          if (this.authService.isAdmin()) {
            this.router.navigate(["/pages/produit"]);
          } else if (this.authService.isVendeur()) {
            this.router.navigate(["/pages/produit"]);
          } else {
            this.router.navigate(["/pages/produit"]);
          }
        }, 1200);
      }
    });
  }
  showMessage(message, isError = false) {
    this.message = message;
    this.isError = isError;
    if (!isError) {
      setTimeout(() => {
        this.message = "";
      }, 5e3);
    }
  }
  goToPage() {
    this.router.navigate(["/sessions/inscription"]);
  }
  resetForm() {
    this.username = "";
    this.password = "";
    this.message = "";
  }
  // Dans connexion.component.ts
  useDemoCredentials(role) {
    if (role === "admin") {
      this.username = "admin";
      this.password = "admin123";
    } else {
      this.username = "vendeur";
      this.password = "vendeur123";
    }
    this.showMessage('Identifiants de d\xE9monstration charg\xE9s. Cliquez sur "Se connecter"', false);
  }
  static {
    this.\u0275fac = function ConnexionComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ConnexionComponent)(\u0275\u0275directiveInject(AuthService), \u0275\u0275directiveInject(Router), \u0275\u0275directiveInject(BoutiqueService));
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ConnexionComponent, selectors: [["app-connexion"]], decls: 30, vars: 10, consts: [["f", "ngForm"], [1, "auth-bg"], [1, "form-wrapper"], [1, "card", "auth-card"], [1, "d-flex", "justify-content-between", "align-items-center", "mb-2"], [1, "form-title", "mb-0"], ["routerLink", "/sessions/boutique-settings", 1, "small"], [1, "registration"], ["type", "button", 3, "click"], ["class", "alert-message", 3, "ngClass", 4, "ngIf"], [3, "ngSubmit"], [1, "input-group-custom", "mb-3"], [1, "icon"], ["name", "username", "placeholder", "Nom d'utilisateur", "required", "", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], [1, "form-text", "text-muted"], ["name", "password", "type", "password", "required", "", "minlength", "6", "placeholder", "Mot de passe", 1, "form-control", 3, "ngModelChange", "ngModel", "disabled"], ["type", "submit", 1, "btn", "btn-primary", "btn-block", 3, "disabled"], [4, "ngIf"], ["class", "debug-info mt-4", 4, "ngIf"], [1, "alert-message", 3, "ngClass"], [1, "fa", "fa-spinner", "fa-spin"], [1, "debug-info", "mt-4"], [1, "text-success"], [1, "fa", "fa-check-circle"]], template: function ConnexionComponent_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = \u0275\u0275getCurrentView();
        \u0275\u0275elementStart(0, "div", 1)(1, "div", 2)(2, "div", 3)(3, "div", 4)(4, "h3", 5);
        \u0275\u0275text(5);
        \u0275\u0275elementEnd();
        \u0275\u0275element(6, "a", 6);
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(7, "div", 7);
        \u0275\u0275text(8, " Besoin d'un compte ? ");
        \u0275\u0275elementStart(9, "button", 8);
        \u0275\u0275listener("click", function ConnexionComponent_Template_button_click_9_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.goToPage());
        });
        \u0275\u0275text(10, "Cliquez ici");
        \u0275\u0275elementEnd()();
        \u0275\u0275template(11, ConnexionComponent_div_11_Template, 2, 5, "div", 9);
        \u0275\u0275elementStart(12, "form", 10, 0);
        \u0275\u0275listener("ngSubmit", function ConnexionComponent_Template_form_ngSubmit_12_listener() {
          \u0275\u0275restoreView(_r1);
          return \u0275\u0275resetView(ctx.login());
        });
        \u0275\u0275elementStart(14, "div", 11)(15, "div", 12);
        \u0275\u0275text(16, "\u{1F464}");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(17, "input", 13);
        \u0275\u0275twoWayListener("ngModelChange", function ConnexionComponent_Template_input_ngModelChange_17_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.username, $event) || (ctx.username = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(18, "small", 14);
        \u0275\u0275text(19, "Utilisez votre nom d'utilisateur");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(20, "div", 11)(21, "div", 12);
        \u0275\u0275text(22, "\u{1F512}");
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(23, "input", 15);
        \u0275\u0275twoWayListener("ngModelChange", function ConnexionComponent_Template_input_ngModelChange_23_listener($event) {
          \u0275\u0275restoreView(_r1);
          \u0275\u0275twoWayBindingSet(ctx.password, $event) || (ctx.password = $event);
          return \u0275\u0275resetView($event);
        });
        \u0275\u0275elementEnd();
        \u0275\u0275elementStart(24, "small", 14);
        \u0275\u0275text(25, "Minimum 6 caract\xE8res");
        \u0275\u0275elementEnd()();
        \u0275\u0275elementStart(26, "button", 16);
        \u0275\u0275template(27, ConnexionComponent_span_27_Template, 2, 0, "span", 17)(28, ConnexionComponent_span_28_Template, 3, 0, "span", 17);
        \u0275\u0275elementEnd()();
        \u0275\u0275template(29, ConnexionComponent_div_29_Template, 4, 1, "div", 18);
        \u0275\u0275elementEnd()()();
      }
      if (rf & 2) {
        \u0275\u0275advance(5);
        \u0275\u0275textInterpolate1("Connexion ", ctx.boutiqueName, "");
        \u0275\u0275advance(6);
        \u0275\u0275property("ngIf", ctx.message);
        \u0275\u0275advance(6);
        \u0275\u0275twoWayProperty("ngModel", ctx.username);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(6);
        \u0275\u0275twoWayProperty("ngModel", ctx.password);
        \u0275\u0275property("disabled", ctx.isLoading);
        \u0275\u0275advance(3);
        \u0275\u0275property("disabled", ctx.isLoading || !ctx.username || !ctx.password);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.isLoading);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.isLoading);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.authService.isAuthenticated());
      }
    }, dependencies: [FormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, RequiredValidator, MinLengthValidator, NgModel, NgForm, CommonModule, NgClass, NgIf], styles: ['\n\n.auth-bg[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(10, 25, 55, 0.75),\n      rgba(10, 25, 55, 0.88)),\n    url(/assets/images/alim1.jpg) center/cover no-repeat;\n  position: relative;\n  overflow: hidden;\n}\n.auth-bg[_ngcontent-%COMP%]::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: rgba(4, 13, 32, 0.32);\n}\n.form-wrapper[_ngcontent-%COMP%] {\n  width: 100%;\n  max-width: 420px;\n  position: relative;\n  z-index: 1;\n}\n.auth-card[_ngcontent-%COMP%] {\n  background: rgba(255, 255, 255, 0.92);\n  border-radius: 24px;\n  padding: 36px;\n  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15);\n  border: 1px solid rgba(255, 255, 255, 0.55);\n  -webkit-backdrop-filter: blur(18px);\n  backdrop-filter: blur(18px);\n}\n.form-title[_ngcontent-%COMP%] {\n  text-align: center;\n  color: #12264d;\n  margin-bottom: 24px;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n.registration[_ngcontent-%COMP%] {\n  text-align: center;\n  margin-bottom: 24px;\n  color: #5e6b8a;\n  font-size: 0.95rem;\n}\n.registration[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  background: none;\n  border: none;\n  color: #2a63ff;\n  cursor: pointer;\n  padding: 0;\n  font-weight: 700;\n  margin-left: 4px;\n}\n.registration[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:hover {\n  text-decoration: underline;\n}\n.alert-message[_ngcontent-%COMP%] {\n  padding: 14px 18px;\n  border-radius: 16px;\n  margin-bottom: 22px;\n  text-align: center;\n  font-weight: 600;\n  color: #12264d;\n  background: rgba(255, 255, 255, 0.9);\n  border: 1px solid rgba(18, 38, 77, 0.08);\n}\n.alert-message.success[_ngcontent-%COMP%] {\n  color: #155724;\n  background: #e9f4ea;\n  border-color: #c6e2ce;\n}\n.alert-message.error[_ngcontent-%COMP%] {\n  color: #7e1f29;\n  background: #f9e3e7;\n  border-color: #f1c6cc;\n}\n.input-group-custom[_ngcontent-%COMP%] {\n  position: relative;\n  margin-bottom: 20px;\n}\n.input-group-custom[_ngcontent-%COMP%]   .icon[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 16px;\n  top: 50%;\n  transform: translateY(-50%);\n  color: #707b94;\n  font-size: 18px;\n}\n.input-group-custom[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%] {\n  padding: 14px 16px 14px 50px;\n  height: 52px;\n  border: 1px solid rgba(18, 38, 77, 0.12);\n  border-radius: 14px;\n  width: 100%;\n  background-color: #fff;\n  color: #12264d;\n  transition: border-color 0.22s ease, box-shadow 0.22s ease;\n}\n.input-group-custom[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%]:focus {\n  border-color: #2a63ff;\n  box-shadow: 0 0 0 4px rgba(42, 99, 255, 0.14);\n  outline: none;\n}\n.input-group-custom[_ngcontent-%COMP%]   .form-control[_ngcontent-%COMP%]:disabled {\n  background-color: #f2f5fb;\n  cursor: not-allowed;\n}\n.input-group-custom[_ngcontent-%COMP%]   .form-text[_ngcontent-%COMP%] {\n  display: block;\n  margin-top: 8px;\n  font-size: 0.82rem;\n  color: #7a859a;\n}\n.btn-primary[_ngcontent-%COMP%] {\n  background:\n    linear-gradient(\n      135deg,\n      #2a63ff 0%,\n      #5e8bff 100%);\n  border: none;\n  height: 52px;\n  width: 100%;\n  font-weight: 700;\n  border-radius: 14px;\n  color: white;\n  transition: transform 0.25s ease, box-shadow 0.25s ease;\n}\n.btn-primary[_ngcontent-%COMP%]:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 20px 30px rgba(42, 99, 255, 0.22);\n}\n.btn-primary[_ngcontent-%COMP%]:disabled {\n  opacity: 0.65;\n  cursor: not-allowed;\n  transform: none;\n  box-shadow: none;\n}\n.debug-info[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 14px 16px;\n  background: rgba(250, 252, 255, 0.9);\n  border-radius: 16px;\n  border: 1px solid rgba(18, 38, 77, 0.08);\n  color: #12264d;\n}\n.fa-spinner[_ngcontent-%COMP%] {\n  margin-right: 8px;\n}\n@media (max-width: 768px) {\n  .auth-card[_ngcontent-%COMP%] {\n    padding: 28px;\n  }\n}\n@media (max-width: 576px) {\n  .auth-bg[_ngcontent-%COMP%] {\n    padding: 16px;\n    background-position: center top;\n  }\n  .auth-card[_ngcontent-%COMP%] {\n    padding: 22px;\n  }\n}\n/*# sourceMappingURL=connexion.component.css.map */'] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ConnexionComponent, [{
    type: Component,
    args: [{ selector: "app-connexion", imports: [FormsModule, CommonModule], template: `<div class="auth-bg">\r
  <div class="form-wrapper">\r
    <div class="card auth-card">\r
      <div class="d-flex justify-content-between align-items-center mb-2">\r
        <h3 class="form-title mb-0">Connexion {{ boutiqueName }}</h3>\r
        <a class="small" routerLink="/sessions/boutique-settings"></a>\r
      </div>\r
\r
      <div class="registration">\r
        Besoin d'un compte ?\r
        <button type="button" (click)="goToPage()">Cliquez ici</button>\r
      </div>\r
\r
      <div class="alert-message" [ngClass]="{ success: !isError, error: isError }" *ngIf="message">\r
        {{ message }}\r
      </div>\r
\r
      <form (ngSubmit)="login()" #f="ngForm">\r
        <div class="input-group-custom mb-3">\r
          <div class="icon">\u{1F464}</div>\r
          <input class="form-control"\r
                 name="username"\r
                 [(ngModel)]="username"\r
                 placeholder="Nom d'utilisateur"\r
                 required\r
                 [disabled]="isLoading" />\r
          <small class="form-text text-muted">Utilisez votre nom d'utilisateur</small>\r
        </div>\r
\r
        <div class="input-group-custom mb-3">\r
          <div class="icon">\u{1F512}</div>\r
          <input class="form-control"\r
                 name="password"\r
                 [(ngModel)]="password"\r
                 type="password"\r
                 required\r
                 minlength="6"\r
                 placeholder="Mot de passe"\r
                 [disabled]="isLoading" />\r
          <small class="form-text text-muted">Minimum 6 caract\xE8res</small>\r
        </div>\r
\r
        <button class="btn btn-primary btn-block"\r
                type="submit"\r
                [disabled]="isLoading || !username || !password">\r
          <span *ngIf="!isLoading">Se connecter</span>\r
          <span *ngIf="isLoading">\r
            <i class="fa fa-spinner fa-spin"></i> Connexion...\r
          </span>\r
        </button>\r
      </form>\r
\r
      <div class="debug-info mt-4" *ngIf="authService.isAuthenticated()">\r
        <small class="text-success">\r
          <i class="fa fa-check-circle"></i>\r
          D\xE9j\xE0 connect\xE9 en tant que: {{ authService.getDisplayName() }}\r
        </small>\r
      </div>\r
    </div>\r
  </div>\r
</div>`, styles: ['/* src/app/views/sessions/connexion/connexion.component.scss */\n.auth-bg {\n  min-height: 100vh;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 24px;\n  background:\n    linear-gradient(\n      180deg,\n      rgba(10, 25, 55, 0.75),\n      rgba(10, 25, 55, 0.88)),\n    url(/assets/images/alim1.jpg) center/cover no-repeat;\n  position: relative;\n  overflow: hidden;\n}\n.auth-bg::before {\n  content: "";\n  position: absolute;\n  inset: 0;\n  background: rgba(4, 13, 32, 0.32);\n}\n.form-wrapper {\n  width: 100%;\n  max-width: 420px;\n  position: relative;\n  z-index: 1;\n}\n.auth-card {\n  background: rgba(255, 255, 255, 0.92);\n  border-radius: 24px;\n  padding: 36px;\n  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.15);\n  border: 1px solid rgba(255, 255, 255, 0.55);\n  -webkit-backdrop-filter: blur(18px);\n  backdrop-filter: blur(18px);\n}\n.form-title {\n  text-align: center;\n  color: #12264d;\n  margin-bottom: 24px;\n  font-weight: 700;\n  letter-spacing: 0.02em;\n}\n.registration {\n  text-align: center;\n  margin-bottom: 24px;\n  color: #5e6b8a;\n  font-size: 0.95rem;\n}\n.registration button {\n  background: none;\n  border: none;\n  color: #2a63ff;\n  cursor: pointer;\n  padding: 0;\n  font-weight: 700;\n  margin-left: 4px;\n}\n.registration button:hover {\n  text-decoration: underline;\n}\n.alert-message {\n  padding: 14px 18px;\n  border-radius: 16px;\n  margin-bottom: 22px;\n  text-align: center;\n  font-weight: 600;\n  color: #12264d;\n  background: rgba(255, 255, 255, 0.9);\n  border: 1px solid rgba(18, 38, 77, 0.08);\n}\n.alert-message.success {\n  color: #155724;\n  background: #e9f4ea;\n  border-color: #c6e2ce;\n}\n.alert-message.error {\n  color: #7e1f29;\n  background: #f9e3e7;\n  border-color: #f1c6cc;\n}\n.input-group-custom {\n  position: relative;\n  margin-bottom: 20px;\n}\n.input-group-custom .icon {\n  position: absolute;\n  left: 16px;\n  top: 50%;\n  transform: translateY(-50%);\n  color: #707b94;\n  font-size: 18px;\n}\n.input-group-custom .form-control {\n  padding: 14px 16px 14px 50px;\n  height: 52px;\n  border: 1px solid rgba(18, 38, 77, 0.12);\n  border-radius: 14px;\n  width: 100%;\n  background-color: #fff;\n  color: #12264d;\n  transition: border-color 0.22s ease, box-shadow 0.22s ease;\n}\n.input-group-custom .form-control:focus {\n  border-color: #2a63ff;\n  box-shadow: 0 0 0 4px rgba(42, 99, 255, 0.14);\n  outline: none;\n}\n.input-group-custom .form-control:disabled {\n  background-color: #f2f5fb;\n  cursor: not-allowed;\n}\n.input-group-custom .form-text {\n  display: block;\n  margin-top: 8px;\n  font-size: 0.82rem;\n  color: #7a859a;\n}\n.btn-primary {\n  background:\n    linear-gradient(\n      135deg,\n      #2a63ff 0%,\n      #5e8bff 100%);\n  border: none;\n  height: 52px;\n  width: 100%;\n  font-weight: 700;\n  border-radius: 14px;\n  color: white;\n  transition: transform 0.25s ease, box-shadow 0.25s ease;\n}\n.btn-primary:hover {\n  transform: translateY(-1px);\n  box-shadow: 0 20px 30px rgba(42, 99, 255, 0.22);\n}\n.btn-primary:disabled {\n  opacity: 0.65;\n  cursor: not-allowed;\n  transform: none;\n  box-shadow: none;\n}\n.debug-info {\n  text-align: center;\n  padding: 14px 16px;\n  background: rgba(250, 252, 255, 0.9);\n  border-radius: 16px;\n  border: 1px solid rgba(18, 38, 77, 0.08);\n  color: #12264d;\n}\n.fa-spinner {\n  margin-right: 8px;\n}\n@media (max-width: 768px) {\n  .auth-card {\n    padding: 28px;\n  }\n}\n@media (max-width: 576px) {\n  .auth-bg {\n    padding: 16px;\n    background-position: center top;\n  }\n  .auth-card {\n    padding: 22px;\n  }\n}\n/*# sourceMappingURL=connexion.component.css.map */\n'] }]
  }], () => [{ type: AuthService }, { type: Router }, { type: BoutiqueService }], null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ConnexionComponent, { className: "ConnexionComponent", filePath: "src/app/views/sessions/connexion/connexion.component.ts", lineNumber: 14 });
})();

// src/app/views/sessions/sessions-routing.module.ts
var routes = [
  {
    path: "inscription",
    component: InscriptionComponent
  },
  {
    path: "connexion",
    component: ConnexionComponent
  },
  {
    path: "boutique-settings",
    loadComponent: () => import("./boutique-settings.component-6PPIV7I7.js").then((m) => m.BoutiqueSettingsComponent)
  }
  // {
  //   path: 'forgot',
  //   component: ForgotComponent
  // }
];
var SessionsRoutingModule = class _SessionsRoutingModule {
  static {
    this.\u0275fac = function SessionsRoutingModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _SessionsRoutingModule)();
    };
  }
  static {
    this.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _SessionsRoutingModule });
  }
  static {
    this.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [RouterModule.forChild(routes), RouterModule] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SessionsRoutingModule, [{
    type: NgModule,
    args: [{
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
    }]
  }], null, null);
})();

// src/app/views/sessions/sessions.module.ts
var SessionsModule = class _SessionsModule {
  static {
    this.\u0275fac = function SessionsModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _SessionsModule)();
    };
  }
  static {
    this.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _SessionsModule });
  }
  static {
    this.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      SharedComponentsModule,
      SessionsRoutingModule
    ] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SessionsModule, [{
    type: NgModule,
    args: [{
      imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedComponentsModule,
        SessionsRoutingModule
      ],
      declarations: []
    }]
  }], null, null);
})();
export {
  SessionsModule
};
//# sourceMappingURL=sessions.module-5NDEILME.js.map
