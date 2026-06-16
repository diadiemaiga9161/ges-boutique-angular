import {
  AUTO_STYLE,
  AdminLayoutSidebarLargeComponent,
  AnimationGroupPlayer,
  AnimationMetadataType,
  AuthLayoutComponent,
  NoopAnimationPlayer,
  SearchModule,
  SharedComponentsModule,
  SharedDirectivesModule,
  SharedPipesModule,
  animate,
  sequence,
  state,
  style,
  transition,
  trigger,
  ɵPRE_STYLE
} from "./chunk-CZ22ESCR.js";
import {
  NgbModule
} from "./chunk-JEGG35UW.js";
import {
  ANIMATION_MODULE_TYPE,
  ApplicationRef,
  AuthService,
  BehaviorSubject,
  BrowserModule,
  ChangeDetectionStrategy,
  CommonModule,
  Component,
  ComponentFactoryResolver$1,
  DOCUMENT,
  DefaultValueAccessor,
  Directive,
  DomRendererFactory2,
  DomSanitizer,
  ElementRef,
  FormsModule,
  HTTP_INTERCEPTORS,
  HostBinding,
  HostListener,
  HttpBackend,
  HttpClientModule,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpXhrBackend,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NEVER,
  NgClass,
  NgControlStatus,
  NgControlStatusGroup,
  NgForOf,
  NgForm,
  NgIf,
  NgModel,
  NgModule,
  NgZone,
  Observable,
  Optional,
  RendererFactory2,
  Router,
  RouterModule,
  RouterOutlet,
  RuntimeError,
  SecurityContext,
  Subject,
  XhrFactory,
  catchError,
  concatMap,
  enableProdMode,
  environment,
  filter,
  first,
  formatRuntimeError,
  from,
  inject,
  isDevMode,
  makeEnvironmentProviders,
  map,
  of,
  platformBrowser,
  provideAppInitializer,
  setClassMetadata,
  signal,
  switchMap,
  take,
  throwError,
  ɵNgNoValidate,
  ɵsetClassDebugInfo,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵinject,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵproperty,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵstyleProp,
  ɵɵsyntheticHostProperty,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate1,
  ɵɵtwoWayBindingSet,
  ɵɵtwoWayListener,
  ɵɵtwoWayProperty
} from "./chunk-RK5GU4B7.js";
import {
  __async,
  __objRest,
  __spreadProps,
  __spreadValues
} from "./chunk-TXDUYLVM.js";

// node_modules/@angular/animations/fesm2022/util-D9FfmVnv.mjs
var LINE_START = "\n - ";
function invalidTimingValue(exp) {
  return new RuntimeError(3e3, ngDevMode && `The provided timing value "${exp}" is invalid.`);
}
function negativeStepValue() {
  return new RuntimeError(3100, ngDevMode && "Duration values below 0 are not allowed for this animation step.");
}
function negativeDelayValue() {
  return new RuntimeError(3101, ngDevMode && "Delay values below 0 are not allowed for this animation step.");
}
function invalidStyleParams(varName) {
  return new RuntimeError(3001, ngDevMode && `Unable to resolve the local animation param ${varName} in the given list of values`);
}
function invalidParamValue(varName) {
  return new RuntimeError(3003, ngDevMode && `Please provide a value for the animation param ${varName}`);
}
function invalidNodeType(nodeType) {
  return new RuntimeError(3004, ngDevMode && `Unable to resolve animation metadata node #${nodeType}`);
}
function invalidCssUnitValue(userProvidedProperty, value) {
  return new RuntimeError(3005, ngDevMode && `Please provide a CSS unit value for ${userProvidedProperty}:${value}`);
}
function invalidTrigger() {
  return new RuntimeError(3006, ngDevMode && "animation triggers cannot be prefixed with an `@` sign (e.g. trigger('@foo', [...]))");
}
function invalidDefinition() {
  return new RuntimeError(3007, ngDevMode && "only state() and transition() definitions can sit inside of a trigger()");
}
function invalidState(metadataName, missingSubs) {
  return new RuntimeError(3008, ngDevMode && `state("${metadataName}", ...) must define default values for all the following style substitutions: ${missingSubs.join(", ")}`);
}
function invalidStyleValue(value) {
  return new RuntimeError(3002, ngDevMode && `The provided style string value ${value} is not allowed.`);
}
function invalidParallelAnimation(prop, firstStart, firstEnd, secondStart, secondEnd) {
  return new RuntimeError(3010, ngDevMode && `The CSS property "${prop}" that exists between the times of "${firstStart}ms" and "${firstEnd}ms" is also being animated in a parallel animation between the times of "${secondStart}ms" and "${secondEnd}ms"`);
}
function invalidKeyframes() {
  return new RuntimeError(3011, ngDevMode && `keyframes() must be placed inside of a call to animate()`);
}
function invalidOffset() {
  return new RuntimeError(3012, ngDevMode && `Please ensure that all keyframe offsets are between 0 and 1`);
}
function keyframeOffsetsOutOfOrder() {
  return new RuntimeError(3200, ngDevMode && `Please ensure that all keyframe offsets are in order`);
}
function keyframesMissingOffsets() {
  return new RuntimeError(3202, ngDevMode && `Not all style() steps within the declared keyframes() contain offsets`);
}
function invalidStagger() {
  return new RuntimeError(3013, ngDevMode && `stagger() can only be used inside of query()`);
}
function invalidQuery(selector) {
  return new RuntimeError(3014, ngDevMode && `\`query("${selector}")\` returned zero elements. (Use \`query("${selector}", { optional: true })\` if you wish to allow this.)`);
}
function invalidExpression(expr) {
  return new RuntimeError(3015, ngDevMode && `The provided transition expression "${expr}" is not supported`);
}
function invalidTransitionAlias(alias) {
  return new RuntimeError(3016, ngDevMode && `The transition alias value "${alias}" is not supported`);
}
function triggerBuildFailed(name, errors) {
  return new RuntimeError(3404, ngDevMode && `The animation trigger "${name}" has failed to build due to the following errors:
 - ${errors.map((err) => err.message).join("\n - ")}`);
}
function animationFailed(errors) {
  return new RuntimeError(3502, ngDevMode && `Unable to animate due to the following errors:${LINE_START}${errors.map((err) => err.message).join(LINE_START)}`);
}
function registerFailed(errors) {
  return new RuntimeError(3503, ngDevMode && `Unable to build the animation due to the following errors: ${errors.map((err) => err.message).join("\n")}`);
}
function missingOrDestroyedAnimation() {
  return new RuntimeError(3300, ngDevMode && "The requested animation doesn't exist or has already been destroyed");
}
function createAnimationFailed(errors) {
  return new RuntimeError(3504, ngDevMode && `Unable to create the animation due to the following errors:${errors.map((err) => err.message).join("\n")}`);
}
function missingPlayer(id) {
  return new RuntimeError(3301, ngDevMode && `Unable to find the timeline player referenced by ${id}`);
}
function missingTrigger(phase, name) {
  return new RuntimeError(3302, ngDevMode && `Unable to listen on the animation trigger event "${phase}" because the animation trigger "${name}" doesn't exist!`);
}
function missingEvent(name) {
  return new RuntimeError(3303, ngDevMode && `Unable to listen on the animation trigger "${name}" because the provided event is undefined!`);
}
function unsupportedTriggerEvent(phase, name) {
  return new RuntimeError(3400, ngDevMode && `The provided animation trigger event "${phase}" for the animation trigger "${name}" is not supported!`);
}
function unregisteredTrigger(name) {
  return new RuntimeError(3401, ngDevMode && `The provided animation trigger "${name}" has not been registered!`);
}
function triggerTransitionsFailed(errors) {
  return new RuntimeError(3402, ngDevMode && `Unable to process animations due to the following failed trigger transitions
 ${errors.map((err) => err.message).join("\n")}`);
}
function transitionFailed(name, errors) {
  return new RuntimeError(3505, ngDevMode && `@${name} has failed due to:
 ${errors.map((err) => err.message).join("\n- ")}`);
}
var ANIMATABLE_PROP_SET = /* @__PURE__ */ new Set(["-moz-outline-radius", "-moz-outline-radius-bottomleft", "-moz-outline-radius-bottomright", "-moz-outline-radius-topleft", "-moz-outline-radius-topright", "-ms-grid-columns", "-ms-grid-rows", "-webkit-line-clamp", "-webkit-text-fill-color", "-webkit-text-stroke", "-webkit-text-stroke-color", "accent-color", "all", "backdrop-filter", "background", "background-color", "background-position", "background-size", "block-size", "border", "border-block-end", "border-block-end-color", "border-block-end-width", "border-block-start", "border-block-start-color", "border-block-start-width", "border-bottom", "border-bottom-color", "border-bottom-left-radius", "border-bottom-right-radius", "border-bottom-width", "border-color", "border-end-end-radius", "border-end-start-radius", "border-image-outset", "border-image-slice", "border-image-width", "border-inline-end", "border-inline-end-color", "border-inline-end-width", "border-inline-start", "border-inline-start-color", "border-inline-start-width", "border-left", "border-left-color", "border-left-width", "border-radius", "border-right", "border-right-color", "border-right-width", "border-start-end-radius", "border-start-start-radius", "border-top", "border-top-color", "border-top-left-radius", "border-top-right-radius", "border-top-width", "border-width", "bottom", "box-shadow", "caret-color", "clip", "clip-path", "color", "column-count", "column-gap", "column-rule", "column-rule-color", "column-rule-width", "column-width", "columns", "filter", "flex", "flex-basis", "flex-grow", "flex-shrink", "font", "font-size", "font-size-adjust", "font-stretch", "font-variation-settings", "font-weight", "gap", "grid-column-gap", "grid-gap", "grid-row-gap", "grid-template-columns", "grid-template-rows", "height", "inline-size", "input-security", "inset", "inset-block", "inset-block-end", "inset-block-start", "inset-inline", "inset-inline-end", "inset-inline-start", "left", "letter-spacing", "line-clamp", "line-height", "margin", "margin-block-end", "margin-block-start", "margin-bottom", "margin-inline-end", "margin-inline-start", "margin-left", "margin-right", "margin-top", "mask", "mask-border", "mask-position", "mask-size", "max-block-size", "max-height", "max-inline-size", "max-lines", "max-width", "min-block-size", "min-height", "min-inline-size", "min-width", "object-position", "offset", "offset-anchor", "offset-distance", "offset-path", "offset-position", "offset-rotate", "opacity", "order", "outline", "outline-color", "outline-offset", "outline-width", "padding", "padding-block-end", "padding-block-start", "padding-bottom", "padding-inline-end", "padding-inline-start", "padding-left", "padding-right", "padding-top", "perspective", "perspective-origin", "right", "rotate", "row-gap", "scale", "scroll-margin", "scroll-margin-block", "scroll-margin-block-end", "scroll-margin-block-start", "scroll-margin-bottom", "scroll-margin-inline", "scroll-margin-inline-end", "scroll-margin-inline-start", "scroll-margin-left", "scroll-margin-right", "scroll-margin-top", "scroll-padding", "scroll-padding-block", "scroll-padding-block-end", "scroll-padding-block-start", "scroll-padding-bottom", "scroll-padding-inline", "scroll-padding-inline-end", "scroll-padding-inline-start", "scroll-padding-left", "scroll-padding-right", "scroll-padding-top", "scroll-snap-coordinate", "scroll-snap-destination", "scrollbar-color", "shape-image-threshold", "shape-margin", "shape-outside", "tab-size", "text-decoration", "text-decoration-color", "text-decoration-thickness", "text-emphasis", "text-emphasis-color", "text-indent", "text-shadow", "text-underline-offset", "top", "transform", "transform-origin", "translate", "vertical-align", "visibility", "width", "word-spacing", "z-index", "zoom"]);
function optimizeGroupPlayer(players) {
  switch (players.length) {
    case 0:
      return new NoopAnimationPlayer();
    case 1:
      return players[0];
    default:
      return new AnimationGroupPlayer(players);
  }
}
function normalizeKeyframes$1(normalizer, keyframes, preStyles = /* @__PURE__ */ new Map(), postStyles = /* @__PURE__ */ new Map()) {
  const errors = [];
  const normalizedKeyframes = [];
  let previousOffset = -1;
  let previousKeyframe = null;
  keyframes.forEach((kf) => {
    const offset = kf.get("offset");
    const isSameOffset = offset == previousOffset;
    const normalizedKeyframe = isSameOffset && previousKeyframe || /* @__PURE__ */ new Map();
    kf.forEach((val, prop) => {
      let normalizedProp = prop;
      let normalizedValue = val;
      if (prop !== "offset") {
        normalizedProp = normalizer.normalizePropertyName(normalizedProp, errors);
        switch (normalizedValue) {
          case \u0275PRE_STYLE:
            normalizedValue = preStyles.get(prop);
            break;
          case AUTO_STYLE:
            normalizedValue = postStyles.get(prop);
            break;
          default:
            normalizedValue = normalizer.normalizeStyleValue(prop, normalizedProp, normalizedValue, errors);
            break;
        }
      }
      normalizedKeyframe.set(normalizedProp, normalizedValue);
    });
    if (!isSameOffset) {
      normalizedKeyframes.push(normalizedKeyframe);
    }
    previousKeyframe = normalizedKeyframe;
    previousOffset = offset;
  });
  if (errors.length) {
    throw animationFailed(errors);
  }
  return normalizedKeyframes;
}
function listenOnPlayer(player, eventName, event, callback) {
  switch (eventName) {
    case "start":
      player.onStart(() => callback(event && copyAnimationEvent(event, "start", player)));
      break;
    case "done":
      player.onDone(() => callback(event && copyAnimationEvent(event, "done", player)));
      break;
    case "destroy":
      player.onDestroy(() => callback(event && copyAnimationEvent(event, "destroy", player)));
      break;
  }
}
function copyAnimationEvent(e, phaseName, player) {
  const totalTime = player.totalTime;
  const disabled = player.disabled ? true : false;
  const event = makeAnimationEvent(e.element, e.triggerName, e.fromState, e.toState, phaseName || e.phaseName, totalTime == void 0 ? e.totalTime : totalTime, disabled);
  const data = e["_data"];
  if (data != null) {
    event["_data"] = data;
  }
  return event;
}
function makeAnimationEvent(element, triggerName, fromState, toState, phaseName = "", totalTime = 0, disabled) {
  return {
    element,
    triggerName,
    fromState,
    toState,
    phaseName,
    totalTime,
    disabled: !!disabled
  };
}
function getOrSetDefaultValue(map2, key, defaultValue) {
  let value = map2.get(key);
  if (!value) {
    map2.set(key, value = defaultValue);
  }
  return value;
}
function parseTimelineCommand(command) {
  const separatorPos = command.indexOf(":");
  const id = command.substring(1, separatorPos);
  const action = command.slice(separatorPos + 1);
  return [id, action];
}
var documentElement = /* @__PURE__ */ (() => typeof document === "undefined" ? null : document.documentElement)();
function getParentElement(element) {
  const parent = element.parentNode || element.host || null;
  if (parent === documentElement) {
    return null;
  }
  return parent;
}
function containsVendorPrefix(prop) {
  return prop.substring(1, 6) == "ebkit";
}
var _CACHED_BODY = null;
var _IS_WEBKIT = false;
function validateStyleProperty(prop) {
  if (!_CACHED_BODY) {
    _CACHED_BODY = getBodyNode() || {};
    _IS_WEBKIT = _CACHED_BODY.style ? "WebkitAppearance" in _CACHED_BODY.style : false;
  }
  let result = true;
  if (_CACHED_BODY.style && !containsVendorPrefix(prop)) {
    result = prop in _CACHED_BODY.style;
    if (!result && _IS_WEBKIT) {
      const camelProp = "Webkit" + prop.charAt(0).toUpperCase() + prop.slice(1);
      result = camelProp in _CACHED_BODY.style;
    }
  }
  return result;
}
function validateWebAnimatableStyleProperty(prop) {
  return ANIMATABLE_PROP_SET.has(prop);
}
function getBodyNode() {
  if (typeof document != "undefined") {
    return document.body;
  }
  return null;
}
function containsElement(elm1, elm2) {
  while (elm2) {
    if (elm2 === elm1) {
      return true;
    }
    elm2 = getParentElement(elm2);
  }
  return false;
}
function invokeQuery(element, selector, multi) {
  if (multi) {
    return Array.from(element.querySelectorAll(selector));
  }
  const elem = element.querySelector(selector);
  return elem ? [elem] : [];
}
var ONE_SECOND = 1e3;
var SUBSTITUTION_EXPR_START = "{{";
var SUBSTITUTION_EXPR_END = "}}";
var ENTER_CLASSNAME = "ng-enter";
var LEAVE_CLASSNAME = "ng-leave";
var NG_TRIGGER_CLASSNAME = "ng-trigger";
var NG_TRIGGER_SELECTOR = ".ng-trigger";
var NG_ANIMATING_CLASSNAME = "ng-animating";
var NG_ANIMATING_SELECTOR = ".ng-animating";
function resolveTimingValue(value) {
  if (typeof value == "number") return value;
  const matches = value.match(/^(-?[\.\d]+)(m?s)/);
  if (!matches || matches.length < 2) return 0;
  return _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
}
function _convertTimeValueToMS(value, unit) {
  switch (unit) {
    case "s":
      return value * ONE_SECOND;
    default:
      return value;
  }
}
function resolveTiming(timings, errors, allowNegativeValues) {
  return timings.hasOwnProperty("duration") ? timings : parseTimeExpression(timings, errors, allowNegativeValues);
}
function parseTimeExpression(exp, errors, allowNegativeValues) {
  const regex = /^(-?[\.\d]+)(m?s)(?:\s+(-?[\.\d]+)(m?s))?(?:\s+([-a-z]+(?:\(.+?\))?))?$/i;
  let duration;
  let delay = 0;
  let easing = "";
  if (typeof exp === "string") {
    const matches = exp.match(regex);
    if (matches === null) {
      errors.push(invalidTimingValue(exp));
      return {
        duration: 0,
        delay: 0,
        easing: ""
      };
    }
    duration = _convertTimeValueToMS(parseFloat(matches[1]), matches[2]);
    const delayMatch = matches[3];
    if (delayMatch != null) {
      delay = _convertTimeValueToMS(parseFloat(delayMatch), matches[4]);
    }
    const easingVal = matches[5];
    if (easingVal) {
      easing = easingVal;
    }
  } else {
    duration = exp;
  }
  if (!allowNegativeValues) {
    let containsErrors = false;
    let startIndex = errors.length;
    if (duration < 0) {
      errors.push(negativeStepValue());
      containsErrors = true;
    }
    if (delay < 0) {
      errors.push(negativeDelayValue());
      containsErrors = true;
    }
    if (containsErrors) {
      errors.splice(startIndex, 0, invalidTimingValue(exp));
    }
  }
  return {
    duration,
    delay,
    easing
  };
}
function normalizeKeyframes(keyframes) {
  if (!keyframes.length) {
    return [];
  }
  if (keyframes[0] instanceof Map) {
    return keyframes;
  }
  return keyframes.map((kf) => new Map(Object.entries(kf)));
}
function setStyles(element, styles, formerStyles) {
  styles.forEach((val, prop) => {
    const camelProp = dashCaseToCamelCase(prop);
    if (formerStyles && !formerStyles.has(prop)) {
      formerStyles.set(prop, element.style[camelProp]);
    }
    element.style[camelProp] = val;
  });
}
function eraseStyles(element, styles) {
  styles.forEach((_, prop) => {
    const camelProp = dashCaseToCamelCase(prop);
    element.style[camelProp] = "";
  });
}
function normalizeAnimationEntry(steps) {
  if (Array.isArray(steps)) {
    if (steps.length == 1) return steps[0];
    return sequence(steps);
  }
  return steps;
}
function validateStyleParams(value, options, errors) {
  const params = options.params || {};
  const matches = extractStyleParams(value);
  if (matches.length) {
    matches.forEach((varName) => {
      if (!params.hasOwnProperty(varName)) {
        errors.push(invalidStyleParams(varName));
      }
    });
  }
}
var PARAM_REGEX = /* @__PURE__ */ new RegExp(`${SUBSTITUTION_EXPR_START}\\s*(.+?)\\s*${SUBSTITUTION_EXPR_END}`, "g");
function extractStyleParams(value) {
  let params = [];
  if (typeof value === "string") {
    let match;
    while (match = PARAM_REGEX.exec(value)) {
      params.push(match[1]);
    }
    PARAM_REGEX.lastIndex = 0;
  }
  return params;
}
function interpolateParams(value, params, errors) {
  const original = `${value}`;
  const str = original.replace(PARAM_REGEX, (_, varName) => {
    let localVal = params[varName];
    if (localVal == null) {
      errors.push(invalidParamValue(varName));
      localVal = "";
    }
    return localVal.toString();
  });
  return str == original ? value : str;
}
var DASH_CASE_REGEXP = /-+([a-z0-9])/g;
function dashCaseToCamelCase(input) {
  return input.replace(DASH_CASE_REGEXP, (...m) => m[1].toUpperCase());
}
function camelCaseToDashCase(input) {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function allowPreviousPlayerStylesMerge(duration, delay) {
  return duration === 0 || delay === 0;
}
function balancePreviousStylesIntoKeyframes(element, keyframes, previousStyles) {
  if (previousStyles.size && keyframes.length) {
    let startingKeyframe = keyframes[0];
    let missingStyleProps = [];
    previousStyles.forEach((val, prop) => {
      if (!startingKeyframe.has(prop)) {
        missingStyleProps.push(prop);
      }
      startingKeyframe.set(prop, val);
    });
    if (missingStyleProps.length) {
      for (let i = 1; i < keyframes.length; i++) {
        let kf = keyframes[i];
        missingStyleProps.forEach((prop) => kf.set(prop, computeStyle(element, prop)));
      }
    }
  }
  return keyframes;
}
function visitDslNode(visitor, node, context) {
  switch (node.type) {
    case AnimationMetadataType.Trigger:
      return visitor.visitTrigger(node, context);
    case AnimationMetadataType.State:
      return visitor.visitState(node, context);
    case AnimationMetadataType.Transition:
      return visitor.visitTransition(node, context);
    case AnimationMetadataType.Sequence:
      return visitor.visitSequence(node, context);
    case AnimationMetadataType.Group:
      return visitor.visitGroup(node, context);
    case AnimationMetadataType.Animate:
      return visitor.visitAnimate(node, context);
    case AnimationMetadataType.Keyframes:
      return visitor.visitKeyframes(node, context);
    case AnimationMetadataType.Style:
      return visitor.visitStyle(node, context);
    case AnimationMetadataType.Reference:
      return visitor.visitReference(node, context);
    case AnimationMetadataType.AnimateChild:
      return visitor.visitAnimateChild(node, context);
    case AnimationMetadataType.AnimateRef:
      return visitor.visitAnimateRef(node, context);
    case AnimationMetadataType.Query:
      return visitor.visitQuery(node, context);
    case AnimationMetadataType.Stagger:
      return visitor.visitStagger(node, context);
    default:
      throw invalidNodeType(node.type);
  }
}
function computeStyle(element, prop) {
  return window.getComputedStyle(element)[prop];
}

// node_modules/@angular/animations/fesm2022/browser.mjs
var NoopAnimationDriver = class _NoopAnimationDriver {
  /**
   * @returns Whether `prop` is a valid CSS property
   */
  validateStyleProperty(prop) {
    return validateStyleProperty(prop);
  }
  /**
   *
   * @returns Whether elm1 contains elm2.
   */
  containsElement(elm1, elm2) {
    return containsElement(elm1, elm2);
  }
  /**
   * @returns Rhe parent of the given element or `null` if the element is the `document`
   */
  getParentElement(element) {
    return getParentElement(element);
  }
  /**
   * @returns The result of the query selector on the element. The array will contain up to 1 item
   *     if `multi` is  `false`.
   */
  query(element, selector, multi) {
    return invokeQuery(element, selector, multi);
  }
  /**
   * @returns The `defaultValue` or empty string
   */
  computeStyle(element, prop, defaultValue) {
    return defaultValue || "";
  }
  /**
   * @returns An `NoopAnimationPlayer`
   */
  animate(element, keyframes, duration, delay, easing, previousPlayers = [], scrubberAccessRequested) {
    return new NoopAnimationPlayer(duration, delay);
  }
  static \u0275fac = function NoopAnimationDriver_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NoopAnimationDriver)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _NoopAnimationDriver,
    factory: _NoopAnimationDriver.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NoopAnimationDriver, [{
    type: Injectable
  }], null, null);
})();
var AnimationDriver = class {
  /**
   * @deprecated Use the NoopAnimationDriver class.
   */
  static NOOP = new NoopAnimationDriver();
};
var AnimationStyleNormalizer = class {
};
var DIMENSIONAL_PROP_SET = /* @__PURE__ */ new Set(["width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", "left", "top", "bottom", "right", "fontSize", "outlineWidth", "outlineOffset", "paddingTop", "paddingLeft", "paddingBottom", "paddingRight", "marginTop", "marginLeft", "marginBottom", "marginRight", "borderRadius", "borderWidth", "borderTopWidth", "borderLeftWidth", "borderRightWidth", "borderBottomWidth", "textIndent", "perspective"]);
var WebAnimationsStyleNormalizer = class extends AnimationStyleNormalizer {
  normalizePropertyName(propertyName, errors) {
    return dashCaseToCamelCase(propertyName);
  }
  normalizeStyleValue(userProvidedProperty, normalizedProperty, value, errors) {
    let unit = "";
    const strVal = value.toString().trim();
    if (DIMENSIONAL_PROP_SET.has(normalizedProperty) && value !== 0 && value !== "0") {
      if (typeof value === "number") {
        unit = "px";
      } else {
        const valAndSuffixMatch = value.match(/^[+-]?[\d\.]+([a-z]*)$/);
        if (valAndSuffixMatch && valAndSuffixMatch[1].length == 0) {
          errors.push(invalidCssUnitValue(userProvidedProperty, value));
        }
      }
    }
    return strVal + unit;
  }
};
function createListOfWarnings(warnings) {
  const LINE_START2 = "\n - ";
  return `${LINE_START2}${warnings.filter(Boolean).map((warning) => warning).join(LINE_START2)}`;
}
function warnTriggerBuild(name, warnings) {
  console.warn(`The animation trigger "${name}" has built with the following warnings:${createListOfWarnings(warnings)}`);
}
function warnRegister(warnings) {
  console.warn(`Animation built with the following warnings:${createListOfWarnings(warnings)}`);
}
function pushUnrecognizedPropertiesWarning(warnings, props) {
  if (props.length) {
    warnings.push(`The following provided properties are not recognized: ${props.join(", ")}`);
  }
}
var ANY_STATE = "*";
function parseTransitionExpr(transitionValue, errors) {
  const expressions = [];
  if (typeof transitionValue == "string") {
    transitionValue.split(/\s*,\s*/).forEach((str) => parseInnerTransitionStr(str, expressions, errors));
  } else {
    expressions.push(transitionValue);
  }
  return expressions;
}
function parseInnerTransitionStr(eventStr, expressions, errors) {
  if (eventStr[0] == ":") {
    const result = parseAnimationAlias(eventStr, errors);
    if (typeof result == "function") {
      expressions.push(result);
      return;
    }
    eventStr = result;
  }
  const match = eventStr.match(/^(\*|[-\w]+)\s*(<?[=-]>)\s*(\*|[-\w]+)$/);
  if (match == null || match.length < 4) {
    errors.push(invalidExpression(eventStr));
    return expressions;
  }
  const fromState = match[1];
  const separator = match[2];
  const toState = match[3];
  expressions.push(makeLambdaFromStates(fromState, toState));
  const isFullAnyStateExpr = fromState == ANY_STATE && toState == ANY_STATE;
  if (separator[0] == "<" && !isFullAnyStateExpr) {
    expressions.push(makeLambdaFromStates(toState, fromState));
  }
  return;
}
function parseAnimationAlias(alias, errors) {
  switch (alias) {
    case ":enter":
      return "void => *";
    case ":leave":
      return "* => void";
    case ":increment":
      return (fromState, toState) => parseFloat(toState) > parseFloat(fromState);
    case ":decrement":
      return (fromState, toState) => parseFloat(toState) < parseFloat(fromState);
    default:
      errors.push(invalidTransitionAlias(alias));
      return "* => *";
  }
}
var TRUE_BOOLEAN_VALUES = /* @__PURE__ */ new Set(["true", "1"]);
var FALSE_BOOLEAN_VALUES = /* @__PURE__ */ new Set(["false", "0"]);
function makeLambdaFromStates(lhs, rhs) {
  const LHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(lhs) || FALSE_BOOLEAN_VALUES.has(lhs);
  const RHS_MATCH_BOOLEAN = TRUE_BOOLEAN_VALUES.has(rhs) || FALSE_BOOLEAN_VALUES.has(rhs);
  return (fromState, toState) => {
    let lhsMatch = lhs == ANY_STATE || lhs == fromState;
    let rhsMatch = rhs == ANY_STATE || rhs == toState;
    if (!lhsMatch && LHS_MATCH_BOOLEAN && typeof fromState === "boolean") {
      lhsMatch = fromState ? TRUE_BOOLEAN_VALUES.has(lhs) : FALSE_BOOLEAN_VALUES.has(lhs);
    }
    if (!rhsMatch && RHS_MATCH_BOOLEAN && typeof toState === "boolean") {
      rhsMatch = toState ? TRUE_BOOLEAN_VALUES.has(rhs) : FALSE_BOOLEAN_VALUES.has(rhs);
    }
    return lhsMatch && rhsMatch;
  };
}
var SELF_TOKEN = ":self";
var SELF_TOKEN_REGEX = /* @__PURE__ */ new RegExp(`s*${SELF_TOKEN}s*,?`, "g");
function buildAnimationAst(driver, metadata, errors, warnings) {
  return new AnimationAstBuilderVisitor(driver).build(metadata, errors, warnings);
}
var ROOT_SELECTOR = "";
var AnimationAstBuilderVisitor = class {
  _driver;
  constructor(_driver) {
    this._driver = _driver;
  }
  build(metadata, errors, warnings) {
    const context = new AnimationAstBuilderContext(errors);
    this._resetContextStyleTimingState(context);
    const ast = visitDslNode(this, normalizeAnimationEntry(metadata), context);
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      if (context.unsupportedCSSPropertiesFound.size) {
        pushUnrecognizedPropertiesWarning(warnings, [...context.unsupportedCSSPropertiesFound.keys()]);
      }
    }
    return ast;
  }
  _resetContextStyleTimingState(context) {
    context.currentQuerySelector = ROOT_SELECTOR;
    context.collectedStyles = /* @__PURE__ */ new Map();
    context.collectedStyles.set(ROOT_SELECTOR, /* @__PURE__ */ new Map());
    context.currentTime = 0;
  }
  visitTrigger(metadata, context) {
    let queryCount = context.queryCount = 0;
    let depCount = context.depCount = 0;
    const states = [];
    const transitions = [];
    if (metadata.name.charAt(0) == "@") {
      context.errors.push(invalidTrigger());
    }
    metadata.definitions.forEach((def) => {
      this._resetContextStyleTimingState(context);
      if (def.type == AnimationMetadataType.State) {
        const stateDef = def;
        const name = stateDef.name;
        name.toString().split(/\s*,\s*/).forEach((n) => {
          stateDef.name = n;
          states.push(this.visitState(stateDef, context));
        });
        stateDef.name = name;
      } else if (def.type == AnimationMetadataType.Transition) {
        const transition2 = this.visitTransition(def, context);
        queryCount += transition2.queryCount;
        depCount += transition2.depCount;
        transitions.push(transition2);
      } else {
        context.errors.push(invalidDefinition());
      }
    });
    return {
      type: AnimationMetadataType.Trigger,
      name: metadata.name,
      states,
      transitions,
      queryCount,
      depCount,
      options: null
    };
  }
  visitState(metadata, context) {
    const styleAst = this.visitStyle(metadata.styles, context);
    const astParams = metadata.options && metadata.options.params || null;
    if (styleAst.containsDynamicStyles) {
      const missingSubs = /* @__PURE__ */ new Set();
      const params = astParams || {};
      styleAst.styles.forEach((style2) => {
        if (style2 instanceof Map) {
          style2.forEach((value) => {
            extractStyleParams(value).forEach((sub) => {
              if (!params.hasOwnProperty(sub)) {
                missingSubs.add(sub);
              }
            });
          });
        }
      });
      if (missingSubs.size) {
        context.errors.push(invalidState(metadata.name, [...missingSubs.values()]));
      }
    }
    return {
      type: AnimationMetadataType.State,
      name: metadata.name,
      style: styleAst,
      options: astParams ? {
        params: astParams
      } : null
    };
  }
  visitTransition(metadata, context) {
    context.queryCount = 0;
    context.depCount = 0;
    const animation = visitDslNode(this, normalizeAnimationEntry(metadata.animation), context);
    const matchers = parseTransitionExpr(metadata.expr, context.errors);
    return {
      type: AnimationMetadataType.Transition,
      matchers,
      animation,
      queryCount: context.queryCount,
      depCount: context.depCount,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitSequence(metadata, context) {
    return {
      type: AnimationMetadataType.Sequence,
      steps: metadata.steps.map((s) => visitDslNode(this, s, context)),
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitGroup(metadata, context) {
    const currentTime = context.currentTime;
    let furthestTime = 0;
    const steps = metadata.steps.map((step) => {
      context.currentTime = currentTime;
      const innerAst = visitDslNode(this, step, context);
      furthestTime = Math.max(furthestTime, context.currentTime);
      return innerAst;
    });
    context.currentTime = furthestTime;
    return {
      type: AnimationMetadataType.Group,
      steps,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitAnimate(metadata, context) {
    const timingAst = constructTimingAst(metadata.timings, context.errors);
    context.currentAnimateTimings = timingAst;
    let styleAst;
    let styleMetadata = metadata.styles ? metadata.styles : style({});
    if (styleMetadata.type == AnimationMetadataType.Keyframes) {
      styleAst = this.visitKeyframes(styleMetadata, context);
    } else {
      let styleMetadata2 = metadata.styles;
      let isEmpty = false;
      if (!styleMetadata2) {
        isEmpty = true;
        const newStyleData = {};
        if (timingAst.easing) {
          newStyleData["easing"] = timingAst.easing;
        }
        styleMetadata2 = style(newStyleData);
      }
      context.currentTime += timingAst.duration + timingAst.delay;
      const _styleAst = this.visitStyle(styleMetadata2, context);
      _styleAst.isEmptyStep = isEmpty;
      styleAst = _styleAst;
    }
    context.currentAnimateTimings = null;
    return {
      type: AnimationMetadataType.Animate,
      timings: timingAst,
      style: styleAst,
      options: null
    };
  }
  visitStyle(metadata, context) {
    const ast = this._makeStyleAst(metadata, context);
    this._validateStyleAst(ast, context);
    return ast;
  }
  _makeStyleAst(metadata, context) {
    const styles = [];
    const metadataStyles = Array.isArray(metadata.styles) ? metadata.styles : [metadata.styles];
    for (let styleTuple of metadataStyles) {
      if (typeof styleTuple === "string") {
        if (styleTuple === AUTO_STYLE) {
          styles.push(styleTuple);
        } else {
          context.errors.push(invalidStyleValue(styleTuple));
        }
      } else {
        styles.push(new Map(Object.entries(styleTuple)));
      }
    }
    let containsDynamicStyles = false;
    let collectedEasing = null;
    styles.forEach((styleData) => {
      if (styleData instanceof Map) {
        if (styleData.has("easing")) {
          collectedEasing = styleData.get("easing");
          styleData.delete("easing");
        }
        if (!containsDynamicStyles) {
          for (let value of styleData.values()) {
            if (value.toString().indexOf(SUBSTITUTION_EXPR_START) >= 0) {
              containsDynamicStyles = true;
              break;
            }
          }
        }
      }
    });
    return {
      type: AnimationMetadataType.Style,
      styles,
      easing: collectedEasing,
      offset: metadata.offset,
      containsDynamicStyles,
      options: null
    };
  }
  _validateStyleAst(ast, context) {
    const timings = context.currentAnimateTimings;
    let endTime = context.currentTime;
    let startTime = context.currentTime;
    if (timings && startTime > 0) {
      startTime -= timings.duration + timings.delay;
    }
    ast.styles.forEach((tuple) => {
      if (typeof tuple === "string") return;
      tuple.forEach((value, prop) => {
        if (typeof ngDevMode === "undefined" || ngDevMode) {
          if (!this._driver.validateStyleProperty(prop)) {
            tuple.delete(prop);
            context.unsupportedCSSPropertiesFound.add(prop);
            return;
          }
        }
        const collectedStyles = context.collectedStyles.get(context.currentQuerySelector);
        const collectedEntry = collectedStyles.get(prop);
        let updateCollectedStyle = true;
        if (collectedEntry) {
          if (startTime != endTime && startTime >= collectedEntry.startTime && endTime <= collectedEntry.endTime) {
            context.errors.push(invalidParallelAnimation(prop, collectedEntry.startTime, collectedEntry.endTime, startTime, endTime));
            updateCollectedStyle = false;
          }
          startTime = collectedEntry.startTime;
        }
        if (updateCollectedStyle) {
          collectedStyles.set(prop, {
            startTime,
            endTime
          });
        }
        if (context.options) {
          validateStyleParams(value, context.options, context.errors);
        }
      });
    });
  }
  visitKeyframes(metadata, context) {
    const ast = {
      type: AnimationMetadataType.Keyframes,
      styles: [],
      options: null
    };
    if (!context.currentAnimateTimings) {
      context.errors.push(invalidKeyframes());
      return ast;
    }
    const MAX_KEYFRAME_OFFSET = 1;
    let totalKeyframesWithOffsets = 0;
    const offsets = [];
    let offsetsOutOfOrder = false;
    let keyframesOutOfRange = false;
    let previousOffset = 0;
    const keyframes = metadata.steps.map((styles) => {
      const style2 = this._makeStyleAst(styles, context);
      let offsetVal = style2.offset != null ? style2.offset : consumeOffset(style2.styles);
      let offset = 0;
      if (offsetVal != null) {
        totalKeyframesWithOffsets++;
        offset = style2.offset = offsetVal;
      }
      keyframesOutOfRange = keyframesOutOfRange || offset < 0 || offset > 1;
      offsetsOutOfOrder = offsetsOutOfOrder || offset < previousOffset;
      previousOffset = offset;
      offsets.push(offset);
      return style2;
    });
    if (keyframesOutOfRange) {
      context.errors.push(invalidOffset());
    }
    if (offsetsOutOfOrder) {
      context.errors.push(keyframeOffsetsOutOfOrder());
    }
    const length = metadata.steps.length;
    let generatedOffset = 0;
    if (totalKeyframesWithOffsets > 0 && totalKeyframesWithOffsets < length) {
      context.errors.push(keyframesMissingOffsets());
    } else if (totalKeyframesWithOffsets == 0) {
      generatedOffset = MAX_KEYFRAME_OFFSET / (length - 1);
    }
    const limit = length - 1;
    const currentTime = context.currentTime;
    const currentAnimateTimings = context.currentAnimateTimings;
    const animateDuration = currentAnimateTimings.duration;
    keyframes.forEach((kf, i) => {
      const offset = generatedOffset > 0 ? i == limit ? 1 : generatedOffset * i : offsets[i];
      const durationUpToThisFrame = offset * animateDuration;
      context.currentTime = currentTime + currentAnimateTimings.delay + durationUpToThisFrame;
      currentAnimateTimings.duration = durationUpToThisFrame;
      this._validateStyleAst(kf, context);
      kf.offset = offset;
      ast.styles.push(kf);
    });
    return ast;
  }
  visitReference(metadata, context) {
    return {
      type: AnimationMetadataType.Reference,
      animation: visitDslNode(this, normalizeAnimationEntry(metadata.animation), context),
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitAnimateChild(metadata, context) {
    context.depCount++;
    return {
      type: AnimationMetadataType.AnimateChild,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitAnimateRef(metadata, context) {
    return {
      type: AnimationMetadataType.AnimateRef,
      animation: this.visitReference(metadata.animation, context),
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitQuery(metadata, context) {
    const parentSelector = context.currentQuerySelector;
    const options = metadata.options || {};
    context.queryCount++;
    context.currentQuery = metadata;
    const [selector, includeSelf] = normalizeSelector(metadata.selector);
    context.currentQuerySelector = parentSelector.length ? parentSelector + " " + selector : selector;
    getOrSetDefaultValue(context.collectedStyles, context.currentQuerySelector, /* @__PURE__ */ new Map());
    const animation = visitDslNode(this, normalizeAnimationEntry(metadata.animation), context);
    context.currentQuery = null;
    context.currentQuerySelector = parentSelector;
    return {
      type: AnimationMetadataType.Query,
      selector,
      limit: options.limit || 0,
      optional: !!options.optional,
      includeSelf,
      animation,
      originalSelector: metadata.selector,
      options: normalizeAnimationOptions(metadata.options)
    };
  }
  visitStagger(metadata, context) {
    if (!context.currentQuery) {
      context.errors.push(invalidStagger());
    }
    const timings = metadata.timings === "full" ? {
      duration: 0,
      delay: 0,
      easing: "full"
    } : resolveTiming(metadata.timings, context.errors, true);
    return {
      type: AnimationMetadataType.Stagger,
      animation: visitDslNode(this, normalizeAnimationEntry(metadata.animation), context),
      timings,
      options: null
    };
  }
};
function normalizeSelector(selector) {
  const hasAmpersand = selector.split(/\s*,\s*/).find((token) => token == SELF_TOKEN) ? true : false;
  if (hasAmpersand) {
    selector = selector.replace(SELF_TOKEN_REGEX, "");
  }
  selector = selector.replace(/@\*/g, NG_TRIGGER_SELECTOR).replace(/@\w+/g, (match) => NG_TRIGGER_SELECTOR + "-" + match.slice(1)).replace(/:animating/g, NG_ANIMATING_SELECTOR);
  return [selector, hasAmpersand];
}
function normalizeParams(obj) {
  return obj ? __spreadValues({}, obj) : null;
}
var AnimationAstBuilderContext = class {
  errors;
  queryCount = 0;
  depCount = 0;
  currentTransition = null;
  currentQuery = null;
  currentQuerySelector = null;
  currentAnimateTimings = null;
  currentTime = 0;
  collectedStyles = /* @__PURE__ */ new Map();
  options = null;
  unsupportedCSSPropertiesFound = /* @__PURE__ */ new Set();
  constructor(errors) {
    this.errors = errors;
  }
};
function consumeOffset(styles) {
  if (typeof styles == "string") return null;
  let offset = null;
  if (Array.isArray(styles)) {
    styles.forEach((styleTuple) => {
      if (styleTuple instanceof Map && styleTuple.has("offset")) {
        const obj = styleTuple;
        offset = parseFloat(obj.get("offset"));
        obj.delete("offset");
      }
    });
  } else if (styles instanceof Map && styles.has("offset")) {
    const obj = styles;
    offset = parseFloat(obj.get("offset"));
    obj.delete("offset");
  }
  return offset;
}
function constructTimingAst(value, errors) {
  if (value.hasOwnProperty("duration")) {
    return value;
  }
  if (typeof value == "number") {
    const duration = resolveTiming(value, errors).duration;
    return makeTimingAst(duration, 0, "");
  }
  const strValue = value;
  const isDynamic = strValue.split(/\s+/).some((v) => v.charAt(0) == "{" && v.charAt(1) == "{");
  if (isDynamic) {
    const ast = makeTimingAst(0, 0, "");
    ast.dynamic = true;
    ast.strValue = strValue;
    return ast;
  }
  const timings = resolveTiming(strValue, errors);
  return makeTimingAst(timings.duration, timings.delay, timings.easing);
}
function normalizeAnimationOptions(options) {
  if (options) {
    options = __spreadValues({}, options);
    if (options["params"]) {
      options["params"] = normalizeParams(options["params"]);
    }
  } else {
    options = {};
  }
  return options;
}
function makeTimingAst(duration, delay, easing) {
  return {
    duration,
    delay,
    easing
  };
}
function createTimelineInstruction(element, keyframes, preStyleProps, postStyleProps, duration, delay, easing = null, subTimeline = false) {
  return {
    type: 1,
    element,
    keyframes,
    preStyleProps,
    postStyleProps,
    duration,
    delay,
    totalTime: duration + delay,
    easing,
    subTimeline
  };
}
var ElementInstructionMap = class {
  _map = /* @__PURE__ */ new Map();
  get(element) {
    return this._map.get(element) || [];
  }
  append(element, instructions) {
    let existingInstructions = this._map.get(element);
    if (!existingInstructions) {
      this._map.set(element, existingInstructions = []);
    }
    existingInstructions.push(...instructions);
  }
  has(element) {
    return this._map.has(element);
  }
  clear() {
    this._map.clear();
  }
};
var ONE_FRAME_IN_MILLISECONDS = 1;
var ENTER_TOKEN = ":enter";
var ENTER_TOKEN_REGEX = /* @__PURE__ */ new RegExp(ENTER_TOKEN, "g");
var LEAVE_TOKEN = ":leave";
var LEAVE_TOKEN_REGEX = /* @__PURE__ */ new RegExp(LEAVE_TOKEN, "g");
function buildAnimationTimelines(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles = /* @__PURE__ */ new Map(), finalStyles = /* @__PURE__ */ new Map(), options, subInstructions, errors = []) {
  return new AnimationTimelineBuilderVisitor().buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors);
}
var AnimationTimelineBuilderVisitor = class {
  buildKeyframes(driver, rootElement, ast, enterClassName, leaveClassName, startingStyles, finalStyles, options, subInstructions, errors = []) {
    subInstructions = subInstructions || new ElementInstructionMap();
    const context = new AnimationTimelineContext(driver, rootElement, subInstructions, enterClassName, leaveClassName, errors, []);
    context.options = options;
    const delay = options.delay ? resolveTimingValue(options.delay) : 0;
    context.currentTimeline.delayNextStep(delay);
    context.currentTimeline.setStyles([startingStyles], null, context.errors, options);
    visitDslNode(this, ast, context);
    const timelines = context.timelines.filter((timeline) => timeline.containsAnimation());
    if (timelines.length && finalStyles.size) {
      let lastRootTimeline;
      for (let i = timelines.length - 1; i >= 0; i--) {
        const timeline = timelines[i];
        if (timeline.element === rootElement) {
          lastRootTimeline = timeline;
          break;
        }
      }
      if (lastRootTimeline && !lastRootTimeline.allowOnlyTimelineStyles()) {
        lastRootTimeline.setStyles([finalStyles], null, context.errors, options);
      }
    }
    return timelines.length ? timelines.map((timeline) => timeline.buildKeyframes()) : [createTimelineInstruction(rootElement, [], [], [], 0, delay, "", false)];
  }
  visitTrigger(ast, context) {
  }
  visitState(ast, context) {
  }
  visitTransition(ast, context) {
  }
  visitAnimateChild(ast, context) {
    const elementInstructions = context.subInstructions.get(context.element);
    if (elementInstructions) {
      const innerContext = context.createSubContext(ast.options);
      const startTime = context.currentTimeline.currentTime;
      const endTime = this._visitSubInstructions(elementInstructions, innerContext, innerContext.options);
      if (startTime != endTime) {
        context.transformIntoNewTimeline(endTime);
      }
    }
    context.previousNode = ast;
  }
  visitAnimateRef(ast, context) {
    const innerContext = context.createSubContext(ast.options);
    innerContext.transformIntoNewTimeline();
    this._applyAnimationRefDelays([ast.options, ast.animation.options], context, innerContext);
    this.visitReference(ast.animation, innerContext);
    context.transformIntoNewTimeline(innerContext.currentTimeline.currentTime);
    context.previousNode = ast;
  }
  _applyAnimationRefDelays(animationsRefsOptions, context, innerContext) {
    for (const animationRefOptions of animationsRefsOptions) {
      const animationDelay = animationRefOptions?.delay;
      if (animationDelay) {
        const animationDelayValue = typeof animationDelay === "number" ? animationDelay : resolveTimingValue(interpolateParams(animationDelay, animationRefOptions?.params ?? {}, context.errors));
        innerContext.delayNextStep(animationDelayValue);
      }
    }
  }
  _visitSubInstructions(instructions, context, options) {
    const startTime = context.currentTimeline.currentTime;
    let furthestTime = startTime;
    const duration = options.duration != null ? resolveTimingValue(options.duration) : null;
    const delay = options.delay != null ? resolveTimingValue(options.delay) : null;
    if (duration !== 0) {
      instructions.forEach((instruction) => {
        const instructionTimings = context.appendInstructionToTimeline(instruction, duration, delay);
        furthestTime = Math.max(furthestTime, instructionTimings.duration + instructionTimings.delay);
      });
    }
    return furthestTime;
  }
  visitReference(ast, context) {
    context.updateOptions(ast.options, true);
    visitDslNode(this, ast.animation, context);
    context.previousNode = ast;
  }
  visitSequence(ast, context) {
    const subContextCount = context.subContextCount;
    let ctx = context;
    const options = ast.options;
    if (options && (options.params || options.delay)) {
      ctx = context.createSubContext(options);
      ctx.transformIntoNewTimeline();
      if (options.delay != null) {
        if (ctx.previousNode.type == AnimationMetadataType.Style) {
          ctx.currentTimeline.snapshotCurrentStyles();
          ctx.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
        }
        const delay = resolveTimingValue(options.delay);
        ctx.delayNextStep(delay);
      }
    }
    if (ast.steps.length) {
      ast.steps.forEach((s) => visitDslNode(this, s, ctx));
      ctx.currentTimeline.applyStylesToKeyframe();
      if (ctx.subContextCount > subContextCount) {
        ctx.transformIntoNewTimeline();
      }
    }
    context.previousNode = ast;
  }
  visitGroup(ast, context) {
    const innerTimelines = [];
    let furthestTime = context.currentTimeline.currentTime;
    const delay = ast.options && ast.options.delay ? resolveTimingValue(ast.options.delay) : 0;
    ast.steps.forEach((s) => {
      const innerContext = context.createSubContext(ast.options);
      if (delay) {
        innerContext.delayNextStep(delay);
      }
      visitDslNode(this, s, innerContext);
      furthestTime = Math.max(furthestTime, innerContext.currentTimeline.currentTime);
      innerTimelines.push(innerContext.currentTimeline);
    });
    innerTimelines.forEach((timeline) => context.currentTimeline.mergeTimelineCollectedStyles(timeline));
    context.transformIntoNewTimeline(furthestTime);
    context.previousNode = ast;
  }
  _visitTiming(ast, context) {
    if (ast.dynamic) {
      const strValue = ast.strValue;
      const timingValue = context.params ? interpolateParams(strValue, context.params, context.errors) : strValue;
      return resolveTiming(timingValue, context.errors);
    } else {
      return {
        duration: ast.duration,
        delay: ast.delay,
        easing: ast.easing
      };
    }
  }
  visitAnimate(ast, context) {
    const timings = context.currentAnimateTimings = this._visitTiming(ast.timings, context);
    const timeline = context.currentTimeline;
    if (timings.delay) {
      context.incrementTime(timings.delay);
      timeline.snapshotCurrentStyles();
    }
    const style2 = ast.style;
    if (style2.type == AnimationMetadataType.Keyframes) {
      this.visitKeyframes(style2, context);
    } else {
      context.incrementTime(timings.duration);
      this.visitStyle(style2, context);
      timeline.applyStylesToKeyframe();
    }
    context.currentAnimateTimings = null;
    context.previousNode = ast;
  }
  visitStyle(ast, context) {
    const timeline = context.currentTimeline;
    const timings = context.currentAnimateTimings;
    if (!timings && timeline.hasCurrentStyleProperties()) {
      timeline.forwardFrame();
    }
    const easing = timings && timings.easing || ast.easing;
    if (ast.isEmptyStep) {
      timeline.applyEmptyStep(easing);
    } else {
      timeline.setStyles(ast.styles, easing, context.errors, context.options);
    }
    context.previousNode = ast;
  }
  visitKeyframes(ast, context) {
    const currentAnimateTimings = context.currentAnimateTimings;
    const startTime = context.currentTimeline.duration;
    const duration = currentAnimateTimings.duration;
    const innerContext = context.createSubContext();
    const innerTimeline = innerContext.currentTimeline;
    innerTimeline.easing = currentAnimateTimings.easing;
    ast.styles.forEach((step) => {
      const offset = step.offset || 0;
      innerTimeline.forwardTime(offset * duration);
      innerTimeline.setStyles(step.styles, step.easing, context.errors, context.options);
      innerTimeline.applyStylesToKeyframe();
    });
    context.currentTimeline.mergeTimelineCollectedStyles(innerTimeline);
    context.transformIntoNewTimeline(startTime + duration);
    context.previousNode = ast;
  }
  visitQuery(ast, context) {
    const startTime = context.currentTimeline.currentTime;
    const options = ast.options || {};
    const delay = options.delay ? resolveTimingValue(options.delay) : 0;
    if (delay && (context.previousNode.type === AnimationMetadataType.Style || startTime == 0 && context.currentTimeline.hasCurrentStyleProperties())) {
      context.currentTimeline.snapshotCurrentStyles();
      context.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
    }
    let furthestTime = startTime;
    const elms = context.invokeQuery(ast.selector, ast.originalSelector, ast.limit, ast.includeSelf, options.optional ? true : false, context.errors);
    context.currentQueryTotal = elms.length;
    let sameElementTimeline = null;
    elms.forEach((element, i) => {
      context.currentQueryIndex = i;
      const innerContext = context.createSubContext(ast.options, element);
      if (delay) {
        innerContext.delayNextStep(delay);
      }
      if (element === context.element) {
        sameElementTimeline = innerContext.currentTimeline;
      }
      visitDslNode(this, ast.animation, innerContext);
      innerContext.currentTimeline.applyStylesToKeyframe();
      const endTime = innerContext.currentTimeline.currentTime;
      furthestTime = Math.max(furthestTime, endTime);
    });
    context.currentQueryIndex = 0;
    context.currentQueryTotal = 0;
    context.transformIntoNewTimeline(furthestTime);
    if (sameElementTimeline) {
      context.currentTimeline.mergeTimelineCollectedStyles(sameElementTimeline);
      context.currentTimeline.snapshotCurrentStyles();
    }
    context.previousNode = ast;
  }
  visitStagger(ast, context) {
    const parentContext = context.parentContext;
    const tl = context.currentTimeline;
    const timings = ast.timings;
    const duration = Math.abs(timings.duration);
    const maxTime = duration * (context.currentQueryTotal - 1);
    let delay = duration * context.currentQueryIndex;
    let staggerTransformer = timings.duration < 0 ? "reverse" : timings.easing;
    switch (staggerTransformer) {
      case "reverse":
        delay = maxTime - delay;
        break;
      case "full":
        delay = parentContext.currentStaggerTime;
        break;
    }
    const timeline = context.currentTimeline;
    if (delay) {
      timeline.delayNextStep(delay);
    }
    const startingTime = timeline.currentTime;
    visitDslNode(this, ast.animation, context);
    context.previousNode = ast;
    parentContext.currentStaggerTime = tl.currentTime - startingTime + (tl.startTime - parentContext.currentTimeline.startTime);
  }
};
var DEFAULT_NOOP_PREVIOUS_NODE = {};
var AnimationTimelineContext = class _AnimationTimelineContext {
  _driver;
  element;
  subInstructions;
  _enterClassName;
  _leaveClassName;
  errors;
  timelines;
  parentContext = null;
  currentTimeline;
  currentAnimateTimings = null;
  previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
  subContextCount = 0;
  options = {};
  currentQueryIndex = 0;
  currentQueryTotal = 0;
  currentStaggerTime = 0;
  constructor(_driver, element, subInstructions, _enterClassName, _leaveClassName, errors, timelines, initialTimeline) {
    this._driver = _driver;
    this.element = element;
    this.subInstructions = subInstructions;
    this._enterClassName = _enterClassName;
    this._leaveClassName = _leaveClassName;
    this.errors = errors;
    this.timelines = timelines;
    this.currentTimeline = initialTimeline || new TimelineBuilder(this._driver, element, 0);
    timelines.push(this.currentTimeline);
  }
  get params() {
    return this.options.params;
  }
  updateOptions(options, skipIfExists) {
    if (!options) return;
    const newOptions = options;
    let optionsToUpdate = this.options;
    if (newOptions.duration != null) {
      optionsToUpdate.duration = resolveTimingValue(newOptions.duration);
    }
    if (newOptions.delay != null) {
      optionsToUpdate.delay = resolveTimingValue(newOptions.delay);
    }
    const newParams = newOptions.params;
    if (newParams) {
      let paramsToUpdate = optionsToUpdate.params;
      if (!paramsToUpdate) {
        paramsToUpdate = this.options.params = {};
      }
      Object.keys(newParams).forEach((name) => {
        if (!skipIfExists || !paramsToUpdate.hasOwnProperty(name)) {
          paramsToUpdate[name] = interpolateParams(newParams[name], paramsToUpdate, this.errors);
        }
      });
    }
  }
  _copyOptions() {
    const options = {};
    if (this.options) {
      const oldParams = this.options.params;
      if (oldParams) {
        const params = options["params"] = {};
        Object.keys(oldParams).forEach((name) => {
          params[name] = oldParams[name];
        });
      }
    }
    return options;
  }
  createSubContext(options = null, element, newTime) {
    const target = element || this.element;
    const context = new _AnimationTimelineContext(this._driver, target, this.subInstructions, this._enterClassName, this._leaveClassName, this.errors, this.timelines, this.currentTimeline.fork(target, newTime || 0));
    context.previousNode = this.previousNode;
    context.currentAnimateTimings = this.currentAnimateTimings;
    context.options = this._copyOptions();
    context.updateOptions(options);
    context.currentQueryIndex = this.currentQueryIndex;
    context.currentQueryTotal = this.currentQueryTotal;
    context.parentContext = this;
    this.subContextCount++;
    return context;
  }
  transformIntoNewTimeline(newTime) {
    this.previousNode = DEFAULT_NOOP_PREVIOUS_NODE;
    this.currentTimeline = this.currentTimeline.fork(this.element, newTime);
    this.timelines.push(this.currentTimeline);
    return this.currentTimeline;
  }
  appendInstructionToTimeline(instruction, duration, delay) {
    const updatedTimings = {
      duration: duration != null ? duration : instruction.duration,
      delay: this.currentTimeline.currentTime + (delay != null ? delay : 0) + instruction.delay,
      easing: ""
    };
    const builder = new SubTimelineBuilder(this._driver, instruction.element, instruction.keyframes, instruction.preStyleProps, instruction.postStyleProps, updatedTimings, instruction.stretchStartingKeyframe);
    this.timelines.push(builder);
    return updatedTimings;
  }
  incrementTime(time) {
    this.currentTimeline.forwardTime(this.currentTimeline.duration + time);
  }
  delayNextStep(delay) {
    if (delay > 0) {
      this.currentTimeline.delayNextStep(delay);
    }
  }
  invokeQuery(selector, originalSelector, limit, includeSelf, optional, errors) {
    let results = [];
    if (includeSelf) {
      results.push(this.element);
    }
    if (selector.length > 0) {
      selector = selector.replace(ENTER_TOKEN_REGEX, "." + this._enterClassName);
      selector = selector.replace(LEAVE_TOKEN_REGEX, "." + this._leaveClassName);
      const multi = limit != 1;
      let elements = this._driver.query(this.element, selector, multi);
      if (limit !== 0) {
        elements = limit < 0 ? elements.slice(elements.length + limit, elements.length) : elements.slice(0, limit);
      }
      results.push(...elements);
    }
    if (!optional && results.length == 0) {
      errors.push(invalidQuery(originalSelector));
    }
    return results;
  }
};
var TimelineBuilder = class _TimelineBuilder {
  _driver;
  element;
  startTime;
  _elementTimelineStylesLookup;
  duration = 0;
  easing = null;
  _previousKeyframe = /* @__PURE__ */ new Map();
  _currentKeyframe = /* @__PURE__ */ new Map();
  _keyframes = /* @__PURE__ */ new Map();
  _styleSummary = /* @__PURE__ */ new Map();
  _localTimelineStyles = /* @__PURE__ */ new Map();
  _globalTimelineStyles;
  _pendingStyles = /* @__PURE__ */ new Map();
  _backFill = /* @__PURE__ */ new Map();
  _currentEmptyStepKeyframe = null;
  constructor(_driver, element, startTime, _elementTimelineStylesLookup) {
    this._driver = _driver;
    this.element = element;
    this.startTime = startTime;
    this._elementTimelineStylesLookup = _elementTimelineStylesLookup;
    if (!this._elementTimelineStylesLookup) {
      this._elementTimelineStylesLookup = /* @__PURE__ */ new Map();
    }
    this._globalTimelineStyles = this._elementTimelineStylesLookup.get(element);
    if (!this._globalTimelineStyles) {
      this._globalTimelineStyles = this._localTimelineStyles;
      this._elementTimelineStylesLookup.set(element, this._localTimelineStyles);
    }
    this._loadKeyframe();
  }
  containsAnimation() {
    switch (this._keyframes.size) {
      case 0:
        return false;
      case 1:
        return this.hasCurrentStyleProperties();
      default:
        return true;
    }
  }
  hasCurrentStyleProperties() {
    return this._currentKeyframe.size > 0;
  }
  get currentTime() {
    return this.startTime + this.duration;
  }
  delayNextStep(delay) {
    const hasPreStyleStep = this._keyframes.size === 1 && this._pendingStyles.size;
    if (this.duration || hasPreStyleStep) {
      this.forwardTime(this.currentTime + delay);
      if (hasPreStyleStep) {
        this.snapshotCurrentStyles();
      }
    } else {
      this.startTime += delay;
    }
  }
  fork(element, currentTime) {
    this.applyStylesToKeyframe();
    return new _TimelineBuilder(this._driver, element, currentTime || this.currentTime, this._elementTimelineStylesLookup);
  }
  _loadKeyframe() {
    if (this._currentKeyframe) {
      this._previousKeyframe = this._currentKeyframe;
    }
    this._currentKeyframe = this._keyframes.get(this.duration);
    if (!this._currentKeyframe) {
      this._currentKeyframe = /* @__PURE__ */ new Map();
      this._keyframes.set(this.duration, this._currentKeyframe);
    }
  }
  forwardFrame() {
    this.duration += ONE_FRAME_IN_MILLISECONDS;
    this._loadKeyframe();
  }
  forwardTime(time) {
    this.applyStylesToKeyframe();
    this.duration = time;
    this._loadKeyframe();
  }
  _updateStyle(prop, value) {
    this._localTimelineStyles.set(prop, value);
    this._globalTimelineStyles.set(prop, value);
    this._styleSummary.set(prop, {
      time: this.currentTime,
      value
    });
  }
  allowOnlyTimelineStyles() {
    return this._currentEmptyStepKeyframe !== this._currentKeyframe;
  }
  applyEmptyStep(easing) {
    if (easing) {
      this._previousKeyframe.set("easing", easing);
    }
    for (let [prop, value] of this._globalTimelineStyles) {
      this._backFill.set(prop, value || AUTO_STYLE);
      this._currentKeyframe.set(prop, AUTO_STYLE);
    }
    this._currentEmptyStepKeyframe = this._currentKeyframe;
  }
  setStyles(input, easing, errors, options) {
    if (easing) {
      this._previousKeyframe.set("easing", easing);
    }
    const params = options && options.params || {};
    const styles = flattenStyles(input, this._globalTimelineStyles);
    for (let [prop, value] of styles) {
      const val = interpolateParams(value, params, errors);
      this._pendingStyles.set(prop, val);
      if (!this._localTimelineStyles.has(prop)) {
        this._backFill.set(prop, this._globalTimelineStyles.get(prop) ?? AUTO_STYLE);
      }
      this._updateStyle(prop, val);
    }
  }
  applyStylesToKeyframe() {
    if (this._pendingStyles.size == 0) return;
    this._pendingStyles.forEach((val, prop) => {
      this._currentKeyframe.set(prop, val);
    });
    this._pendingStyles.clear();
    this._localTimelineStyles.forEach((val, prop) => {
      if (!this._currentKeyframe.has(prop)) {
        this._currentKeyframe.set(prop, val);
      }
    });
  }
  snapshotCurrentStyles() {
    for (let [prop, val] of this._localTimelineStyles) {
      this._pendingStyles.set(prop, val);
      this._updateStyle(prop, val);
    }
  }
  getFinalKeyframe() {
    return this._keyframes.get(this.duration);
  }
  get properties() {
    const properties = [];
    for (let prop in this._currentKeyframe) {
      properties.push(prop);
    }
    return properties;
  }
  mergeTimelineCollectedStyles(timeline) {
    timeline._styleSummary.forEach((details1, prop) => {
      const details0 = this._styleSummary.get(prop);
      if (!details0 || details1.time > details0.time) {
        this._updateStyle(prop, details1.value);
      }
    });
  }
  buildKeyframes() {
    this.applyStylesToKeyframe();
    const preStyleProps = /* @__PURE__ */ new Set();
    const postStyleProps = /* @__PURE__ */ new Set();
    const isEmpty = this._keyframes.size === 1 && this.duration === 0;
    let finalKeyframes = [];
    this._keyframes.forEach((keyframe, time) => {
      const finalKeyframe = new Map([...this._backFill, ...keyframe]);
      finalKeyframe.forEach((value, prop) => {
        if (value === \u0275PRE_STYLE) {
          preStyleProps.add(prop);
        } else if (value === AUTO_STYLE) {
          postStyleProps.add(prop);
        }
      });
      if (!isEmpty) {
        finalKeyframe.set("offset", time / this.duration);
      }
      finalKeyframes.push(finalKeyframe);
    });
    const preProps = [...preStyleProps.values()];
    const postProps = [...postStyleProps.values()];
    if (isEmpty) {
      const kf0 = finalKeyframes[0];
      const kf1 = new Map(kf0);
      kf0.set("offset", 0);
      kf1.set("offset", 1);
      finalKeyframes = [kf0, kf1];
    }
    return createTimelineInstruction(this.element, finalKeyframes, preProps, postProps, this.duration, this.startTime, this.easing, false);
  }
};
var SubTimelineBuilder = class extends TimelineBuilder {
  keyframes;
  preStyleProps;
  postStyleProps;
  _stretchStartingKeyframe;
  timings;
  constructor(driver, element, keyframes, preStyleProps, postStyleProps, timings, _stretchStartingKeyframe = false) {
    super(driver, element, timings.delay);
    this.keyframes = keyframes;
    this.preStyleProps = preStyleProps;
    this.postStyleProps = postStyleProps;
    this._stretchStartingKeyframe = _stretchStartingKeyframe;
    this.timings = {
      duration: timings.duration,
      delay: timings.delay,
      easing: timings.easing
    };
  }
  containsAnimation() {
    return this.keyframes.length > 1;
  }
  buildKeyframes() {
    let keyframes = this.keyframes;
    let {
      delay,
      duration,
      easing
    } = this.timings;
    if (this._stretchStartingKeyframe && delay) {
      const newKeyframes = [];
      const totalTime = duration + delay;
      const startingGap = delay / totalTime;
      const newFirstKeyframe = new Map(keyframes[0]);
      newFirstKeyframe.set("offset", 0);
      newKeyframes.push(newFirstKeyframe);
      const oldFirstKeyframe = new Map(keyframes[0]);
      oldFirstKeyframe.set("offset", roundOffset(startingGap));
      newKeyframes.push(oldFirstKeyframe);
      const limit = keyframes.length - 1;
      for (let i = 1; i <= limit; i++) {
        let kf = new Map(keyframes[i]);
        const oldOffset = kf.get("offset");
        const timeAtKeyframe = delay + oldOffset * duration;
        kf.set("offset", roundOffset(timeAtKeyframe / totalTime));
        newKeyframes.push(kf);
      }
      duration = totalTime;
      delay = 0;
      easing = "";
      keyframes = newKeyframes;
    }
    return createTimelineInstruction(this.element, keyframes, this.preStyleProps, this.postStyleProps, duration, delay, easing, true);
  }
};
function roundOffset(offset, decimalPoints = 3) {
  const mult = Math.pow(10, decimalPoints - 1);
  return Math.round(offset * mult) / mult;
}
function flattenStyles(input, allStyles) {
  const styles = /* @__PURE__ */ new Map();
  let allProperties;
  input.forEach((token) => {
    if (token === "*") {
      allProperties ??= allStyles.keys();
      for (let prop of allProperties) {
        styles.set(prop, AUTO_STYLE);
      }
    } else {
      for (let [prop, val] of token) {
        styles.set(prop, val);
      }
    }
  });
  return styles;
}
function createTransitionInstruction(element, triggerName, fromState, toState, isRemovalTransition, fromStyles, toStyles, timelines, queriedElements, preStyleProps, postStyleProps, totalTime, errors) {
  return {
    type: 0,
    element,
    triggerName,
    isRemovalTransition,
    fromState,
    fromStyles,
    toState,
    toStyles,
    timelines,
    queriedElements,
    preStyleProps,
    postStyleProps,
    totalTime,
    errors
  };
}
var EMPTY_OBJECT = {};
var AnimationTransitionFactory = class {
  _triggerName;
  ast;
  _stateStyles;
  constructor(_triggerName, ast, _stateStyles) {
    this._triggerName = _triggerName;
    this.ast = ast;
    this._stateStyles = _stateStyles;
  }
  match(currentState, nextState, element, params) {
    return oneOrMoreTransitionsMatch(this.ast.matchers, currentState, nextState, element, params);
  }
  buildStyles(stateName, params, errors) {
    let styler = this._stateStyles.get("*");
    if (stateName !== void 0) {
      styler = this._stateStyles.get(stateName?.toString()) || styler;
    }
    return styler ? styler.buildStyles(params, errors) : /* @__PURE__ */ new Map();
  }
  build(driver, element, currentState, nextState, enterClassName, leaveClassName, currentOptions, nextOptions, subInstructions, skipAstBuild) {
    const errors = [];
    const transitionAnimationParams = this.ast.options && this.ast.options.params || EMPTY_OBJECT;
    const currentAnimationParams = currentOptions && currentOptions.params || EMPTY_OBJECT;
    const currentStateStyles = this.buildStyles(currentState, currentAnimationParams, errors);
    const nextAnimationParams = nextOptions && nextOptions.params || EMPTY_OBJECT;
    const nextStateStyles = this.buildStyles(nextState, nextAnimationParams, errors);
    const queriedElements = /* @__PURE__ */ new Set();
    const preStyleMap = /* @__PURE__ */ new Map();
    const postStyleMap = /* @__PURE__ */ new Map();
    const isRemoval = nextState === "void";
    const animationOptions = {
      params: applyParamDefaults(nextAnimationParams, transitionAnimationParams),
      delay: this.ast.options?.delay
    };
    const timelines = skipAstBuild ? [] : buildAnimationTimelines(driver, element, this.ast.animation, enterClassName, leaveClassName, currentStateStyles, nextStateStyles, animationOptions, subInstructions, errors);
    let totalTime = 0;
    timelines.forEach((tl) => {
      totalTime = Math.max(tl.duration + tl.delay, totalTime);
    });
    if (errors.length) {
      return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, [], [], preStyleMap, postStyleMap, totalTime, errors);
    }
    timelines.forEach((tl) => {
      const elm = tl.element;
      const preProps = getOrSetDefaultValue(preStyleMap, elm, /* @__PURE__ */ new Set());
      tl.preStyleProps.forEach((prop) => preProps.add(prop));
      const postProps = getOrSetDefaultValue(postStyleMap, elm, /* @__PURE__ */ new Set());
      tl.postStyleProps.forEach((prop) => postProps.add(prop));
      if (elm !== element) {
        queriedElements.add(elm);
      }
    });
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      checkNonAnimatableInTimelines(timelines, this._triggerName, driver);
    }
    return createTransitionInstruction(element, this._triggerName, currentState, nextState, isRemoval, currentStateStyles, nextStateStyles, timelines, [...queriedElements.values()], preStyleMap, postStyleMap, totalTime);
  }
};
function checkNonAnimatableInTimelines(timelines, triggerName, driver) {
  if (!driver.validateAnimatableStyleProperty) {
    return;
  }
  const allowedNonAnimatableProps = /* @__PURE__ */ new Set([
    // 'easing' is a utility/synthetic prop we use to represent
    // easing functions, it represents a property of the animation
    // which is not animatable but different values can be used
    // in different steps
    "easing"
  ]);
  const invalidNonAnimatableProps = /* @__PURE__ */ new Set();
  timelines.forEach(({
    keyframes
  }) => {
    const nonAnimatablePropsInitialValues = /* @__PURE__ */ new Map();
    keyframes.forEach((keyframe) => {
      const entriesToCheck = Array.from(keyframe.entries()).filter(([prop]) => !allowedNonAnimatableProps.has(prop));
      for (const [prop, value] of entriesToCheck) {
        if (!driver.validateAnimatableStyleProperty(prop)) {
          if (nonAnimatablePropsInitialValues.has(prop) && !invalidNonAnimatableProps.has(prop)) {
            const propInitialValue = nonAnimatablePropsInitialValues.get(prop);
            if (propInitialValue !== value) {
              invalidNonAnimatableProps.add(prop);
            }
          } else {
            nonAnimatablePropsInitialValues.set(prop, value);
          }
        }
      }
    });
  });
  if (invalidNonAnimatableProps.size > 0) {
    console.warn(`Warning: The animation trigger "${triggerName}" is attempting to animate the following not animatable properties: ` + Array.from(invalidNonAnimatableProps).join(", ") + "\n(to check the list of all animatable properties visit https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animated_properties)");
  }
}
function oneOrMoreTransitionsMatch(matchFns, currentState, nextState, element, params) {
  return matchFns.some((fn) => fn(currentState, nextState, element, params));
}
function applyParamDefaults(userParams, defaults) {
  const result = __spreadValues({}, defaults);
  Object.entries(userParams).forEach(([key, value]) => {
    if (value != null) {
      result[key] = value;
    }
  });
  return result;
}
var AnimationStateStyles = class {
  styles;
  defaultParams;
  normalizer;
  constructor(styles, defaultParams, normalizer) {
    this.styles = styles;
    this.defaultParams = defaultParams;
    this.normalizer = normalizer;
  }
  buildStyles(params, errors) {
    const finalStyles = /* @__PURE__ */ new Map();
    const combinedParams = applyParamDefaults(params, this.defaultParams);
    this.styles.styles.forEach((value) => {
      if (typeof value !== "string") {
        value.forEach((val, prop) => {
          if (val) {
            val = interpolateParams(val, combinedParams, errors);
          }
          const normalizedProp = this.normalizer.normalizePropertyName(prop, errors);
          val = this.normalizer.normalizeStyleValue(prop, normalizedProp, val, errors);
          finalStyles.set(prop, val);
        });
      }
    });
    return finalStyles;
  }
};
function buildTrigger(name, ast, normalizer) {
  return new AnimationTrigger(name, ast, normalizer);
}
var AnimationTrigger = class {
  name;
  ast;
  _normalizer;
  transitionFactories = [];
  fallbackTransition;
  states = /* @__PURE__ */ new Map();
  constructor(name, ast, _normalizer) {
    this.name = name;
    this.ast = ast;
    this._normalizer = _normalizer;
    ast.states.forEach((ast2) => {
      const defaultParams = ast2.options && ast2.options.params || {};
      this.states.set(ast2.name, new AnimationStateStyles(ast2.style, defaultParams, _normalizer));
    });
    balanceProperties(this.states, "true", "1");
    balanceProperties(this.states, "false", "0");
    ast.transitions.forEach((ast2) => {
      this.transitionFactories.push(new AnimationTransitionFactory(name, ast2, this.states));
    });
    this.fallbackTransition = createFallbackTransition(name, this.states);
  }
  get containsQueries() {
    return this.ast.queryCount > 0;
  }
  matchTransition(currentState, nextState, element, params) {
    const entry = this.transitionFactories.find((f) => f.match(currentState, nextState, element, params));
    return entry || null;
  }
  matchStyles(currentState, params, errors) {
    return this.fallbackTransition.buildStyles(currentState, params, errors);
  }
};
function createFallbackTransition(triggerName, states, normalizer) {
  const matchers = [(fromState, toState) => true];
  const animation = {
    type: AnimationMetadataType.Sequence,
    steps: [],
    options: null
  };
  const transition2 = {
    type: AnimationMetadataType.Transition,
    animation,
    matchers,
    options: null,
    queryCount: 0,
    depCount: 0
  };
  return new AnimationTransitionFactory(triggerName, transition2, states);
}
function balanceProperties(stateMap, key1, key2) {
  if (stateMap.has(key1)) {
    if (!stateMap.has(key2)) {
      stateMap.set(key2, stateMap.get(key1));
    }
  } else if (stateMap.has(key2)) {
    stateMap.set(key1, stateMap.get(key2));
  }
}
var EMPTY_INSTRUCTION_MAP = /* @__PURE__ */ new ElementInstructionMap();
var TimelineAnimationEngine = class {
  bodyNode;
  _driver;
  _normalizer;
  _animations = /* @__PURE__ */ new Map();
  _playersById = /* @__PURE__ */ new Map();
  players = [];
  constructor(bodyNode, _driver, _normalizer) {
    this.bodyNode = bodyNode;
    this._driver = _driver;
    this._normalizer = _normalizer;
  }
  register(id, metadata) {
    const errors = [];
    const warnings = [];
    const ast = buildAnimationAst(this._driver, metadata, errors, warnings);
    if (errors.length) {
      throw registerFailed(errors);
    } else {
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        if (warnings.length) {
          warnRegister(warnings);
        }
      }
      this._animations.set(id, ast);
    }
  }
  _buildPlayer(i, preStyles, postStyles) {
    const element = i.element;
    const keyframes = normalizeKeyframes$1(this._normalizer, i.keyframes, preStyles, postStyles);
    return this._driver.animate(element, keyframes, i.duration, i.delay, i.easing, [], true);
  }
  create(id, element, options = {}) {
    const errors = [];
    const ast = this._animations.get(id);
    let instructions;
    const autoStylesMap = /* @__PURE__ */ new Map();
    if (ast) {
      instructions = buildAnimationTimelines(this._driver, element, ast, ENTER_CLASSNAME, LEAVE_CLASSNAME, /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map(), options, EMPTY_INSTRUCTION_MAP, errors);
      instructions.forEach((inst) => {
        const styles = getOrSetDefaultValue(autoStylesMap, inst.element, /* @__PURE__ */ new Map());
        inst.postStyleProps.forEach((prop) => styles.set(prop, null));
      });
    } else {
      errors.push(missingOrDestroyedAnimation());
      instructions = [];
    }
    if (errors.length) {
      throw createAnimationFailed(errors);
    }
    autoStylesMap.forEach((styles, element2) => {
      styles.forEach((_, prop) => {
        styles.set(prop, this._driver.computeStyle(element2, prop, AUTO_STYLE));
      });
    });
    const players = instructions.map((i) => {
      const styles = autoStylesMap.get(i.element);
      return this._buildPlayer(i, /* @__PURE__ */ new Map(), styles);
    });
    const player = optimizeGroupPlayer(players);
    this._playersById.set(id, player);
    player.onDestroy(() => this.destroy(id));
    this.players.push(player);
    return player;
  }
  destroy(id) {
    const player = this._getPlayer(id);
    player.destroy();
    this._playersById.delete(id);
    const index = this.players.indexOf(player);
    if (index >= 0) {
      this.players.splice(index, 1);
    }
  }
  _getPlayer(id) {
    const player = this._playersById.get(id);
    if (!player) {
      throw missingPlayer(id);
    }
    return player;
  }
  listen(id, element, eventName, callback) {
    const baseEvent = makeAnimationEvent(element, "", "", "");
    listenOnPlayer(this._getPlayer(id), eventName, baseEvent, callback);
    return () => {
    };
  }
  command(id, element, command, args) {
    if (command == "register") {
      this.register(id, args[0]);
      return;
    }
    if (command == "create") {
      const options = args[0] || {};
      this.create(id, element, options);
      return;
    }
    const player = this._getPlayer(id);
    switch (command) {
      case "play":
        player.play();
        break;
      case "pause":
        player.pause();
        break;
      case "reset":
        player.reset();
        break;
      case "restart":
        player.restart();
        break;
      case "finish":
        player.finish();
        break;
      case "init":
        player.init();
        break;
      case "setPosition":
        player.setPosition(parseFloat(args[0]));
        break;
      case "destroy":
        this.destroy(id);
        break;
    }
  }
};
var QUEUED_CLASSNAME = "ng-animate-queued";
var QUEUED_SELECTOR = ".ng-animate-queued";
var DISABLED_CLASSNAME = "ng-animate-disabled";
var DISABLED_SELECTOR = ".ng-animate-disabled";
var STAR_CLASSNAME = "ng-star-inserted";
var STAR_SELECTOR = ".ng-star-inserted";
var EMPTY_PLAYER_ARRAY = [];
var NULL_REMOVAL_STATE = {
  namespaceId: "",
  setForRemoval: false,
  setForMove: false,
  hasAnimation: false,
  removedBeforeQueried: false
};
var NULL_REMOVED_QUERIED_STATE = {
  namespaceId: "",
  setForMove: false,
  setForRemoval: false,
  hasAnimation: false,
  removedBeforeQueried: true
};
var REMOVAL_FLAG = "__ng_removed";
var StateValue = class {
  namespaceId;
  value;
  options;
  get params() {
    return this.options.params;
  }
  constructor(input, namespaceId = "") {
    this.namespaceId = namespaceId;
    const isObj = input && input.hasOwnProperty("value");
    const value = isObj ? input["value"] : input;
    this.value = normalizeTriggerValue(value);
    if (isObj) {
      const _a = input, {
        value: value2
      } = _a, options = __objRest(_a, [
        "value"
      ]);
      this.options = options;
    } else {
      this.options = {};
    }
    if (!this.options.params) {
      this.options.params = {};
    }
  }
  absorbOptions(options) {
    const newParams = options.params;
    if (newParams) {
      const oldParams = this.options.params;
      Object.keys(newParams).forEach((prop) => {
        if (oldParams[prop] == null) {
          oldParams[prop] = newParams[prop];
        }
      });
    }
  }
};
var VOID_VALUE = "void";
var DEFAULT_STATE_VALUE = /* @__PURE__ */ new StateValue(VOID_VALUE);
var AnimationTransitionNamespace = class {
  id;
  hostElement;
  _engine;
  players = [];
  _triggers = /* @__PURE__ */ new Map();
  _queue = [];
  _elementListeners = /* @__PURE__ */ new Map();
  _hostClassName;
  constructor(id, hostElement, _engine) {
    this.id = id;
    this.hostElement = hostElement;
    this._engine = _engine;
    this._hostClassName = "ng-tns-" + id;
    addClass(hostElement, this._hostClassName);
  }
  listen(element, name, phase, callback) {
    if (!this._triggers.has(name)) {
      throw missingTrigger(phase, name);
    }
    if (phase == null || phase.length == 0) {
      throw missingEvent(name);
    }
    if (!isTriggerEventValid(phase)) {
      throw unsupportedTriggerEvent(phase, name);
    }
    const listeners = getOrSetDefaultValue(this._elementListeners, element, []);
    const data = {
      name,
      phase,
      callback
    };
    listeners.push(data);
    const triggersWithStates = getOrSetDefaultValue(this._engine.statesByElement, element, /* @__PURE__ */ new Map());
    if (!triggersWithStates.has(name)) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + "-" + name);
      triggersWithStates.set(name, DEFAULT_STATE_VALUE);
    }
    return () => {
      this._engine.afterFlush(() => {
        const index = listeners.indexOf(data);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
        if (!this._triggers.has(name)) {
          triggersWithStates.delete(name);
        }
      });
    };
  }
  register(name, ast) {
    if (this._triggers.has(name)) {
      return false;
    } else {
      this._triggers.set(name, ast);
      return true;
    }
  }
  _getTrigger(name) {
    const trigger2 = this._triggers.get(name);
    if (!trigger2) {
      throw unregisteredTrigger(name);
    }
    return trigger2;
  }
  trigger(element, triggerName, value, defaultToFallback = true) {
    const trigger2 = this._getTrigger(triggerName);
    const player = new TransitionAnimationPlayer(this.id, triggerName, element);
    let triggersWithStates = this._engine.statesByElement.get(element);
    if (!triggersWithStates) {
      addClass(element, NG_TRIGGER_CLASSNAME);
      addClass(element, NG_TRIGGER_CLASSNAME + "-" + triggerName);
      this._engine.statesByElement.set(element, triggersWithStates = /* @__PURE__ */ new Map());
    }
    let fromState = triggersWithStates.get(triggerName);
    const toState = new StateValue(value, this.id);
    const isObj = value && value.hasOwnProperty("value");
    if (!isObj && fromState) {
      toState.absorbOptions(fromState.options);
    }
    triggersWithStates.set(triggerName, toState);
    if (!fromState) {
      fromState = DEFAULT_STATE_VALUE;
    }
    const isRemoval = toState.value === VOID_VALUE;
    if (!isRemoval && fromState.value === toState.value) {
      if (!objEquals(fromState.params, toState.params)) {
        const errors = [];
        const fromStyles = trigger2.matchStyles(fromState.value, fromState.params, errors);
        const toStyles = trigger2.matchStyles(toState.value, toState.params, errors);
        if (errors.length) {
          this._engine.reportError(errors);
        } else {
          this._engine.afterFlush(() => {
            eraseStyles(element, fromStyles);
            setStyles(element, toStyles);
          });
        }
      }
      return;
    }
    const playersOnElement = getOrSetDefaultValue(this._engine.playersByElement, element, []);
    playersOnElement.forEach((player2) => {
      if (player2.namespaceId == this.id && player2.triggerName == triggerName && player2.queued) {
        player2.destroy();
      }
    });
    let transition2 = trigger2.matchTransition(fromState.value, toState.value, element, toState.params);
    let isFallbackTransition = false;
    if (!transition2) {
      if (!defaultToFallback) return;
      transition2 = trigger2.fallbackTransition;
      isFallbackTransition = true;
    }
    this._engine.totalQueuedPlayers++;
    this._queue.push({
      element,
      triggerName,
      transition: transition2,
      fromState,
      toState,
      player,
      isFallbackTransition
    });
    if (!isFallbackTransition) {
      addClass(element, QUEUED_CLASSNAME);
      player.onStart(() => {
        removeClass(element, QUEUED_CLASSNAME);
      });
    }
    player.onDone(() => {
      let index = this.players.indexOf(player);
      if (index >= 0) {
        this.players.splice(index, 1);
      }
      const players = this._engine.playersByElement.get(element);
      if (players) {
        let index2 = players.indexOf(player);
        if (index2 >= 0) {
          players.splice(index2, 1);
        }
      }
    });
    this.players.push(player);
    playersOnElement.push(player);
    return player;
  }
  deregister(name) {
    this._triggers.delete(name);
    this._engine.statesByElement.forEach((stateMap) => stateMap.delete(name));
    this._elementListeners.forEach((listeners, element) => {
      this._elementListeners.set(element, listeners.filter((entry) => {
        return entry.name != name;
      }));
    });
  }
  clearElementCache(element) {
    this._engine.statesByElement.delete(element);
    this._elementListeners.delete(element);
    const elementPlayers = this._engine.playersByElement.get(element);
    if (elementPlayers) {
      elementPlayers.forEach((player) => player.destroy());
      this._engine.playersByElement.delete(element);
    }
  }
  _signalRemovalForInnerTriggers(rootElement, context) {
    const elements = this._engine.driver.query(rootElement, NG_TRIGGER_SELECTOR, true);
    elements.forEach((elm) => {
      if (elm[REMOVAL_FLAG]) return;
      const namespaces = this._engine.fetchNamespacesByElement(elm);
      if (namespaces.size) {
        namespaces.forEach((ns) => ns.triggerLeaveAnimation(elm, context, false, true));
      } else {
        this.clearElementCache(elm);
      }
    });
    this._engine.afterFlushAnimationsDone(() => elements.forEach((elm) => this.clearElementCache(elm)));
  }
  triggerLeaveAnimation(element, context, destroyAfterComplete, defaultToFallback) {
    const triggerStates = this._engine.statesByElement.get(element);
    const previousTriggersValues = /* @__PURE__ */ new Map();
    if (triggerStates) {
      const players = [];
      triggerStates.forEach((state2, triggerName) => {
        previousTriggersValues.set(triggerName, state2.value);
        if (this._triggers.has(triggerName)) {
          const player = this.trigger(element, triggerName, VOID_VALUE, defaultToFallback);
          if (player) {
            players.push(player);
          }
        }
      });
      if (players.length) {
        this._engine.markElementAsRemoved(this.id, element, true, context, previousTriggersValues);
        if (destroyAfterComplete) {
          optimizeGroupPlayer(players).onDone(() => this._engine.processLeaveNode(element));
        }
        return true;
      }
    }
    return false;
  }
  prepareLeaveAnimationListeners(element) {
    const listeners = this._elementListeners.get(element);
    const elementStates = this._engine.statesByElement.get(element);
    if (listeners && elementStates) {
      const visitedTriggers = /* @__PURE__ */ new Set();
      listeners.forEach((listener) => {
        const triggerName = listener.name;
        if (visitedTriggers.has(triggerName)) return;
        visitedTriggers.add(triggerName);
        const trigger2 = this._triggers.get(triggerName);
        const transition2 = trigger2.fallbackTransition;
        const fromState = elementStates.get(triggerName) || DEFAULT_STATE_VALUE;
        const toState = new StateValue(VOID_VALUE);
        const player = new TransitionAnimationPlayer(this.id, triggerName, element);
        this._engine.totalQueuedPlayers++;
        this._queue.push({
          element,
          triggerName,
          transition: transition2,
          fromState,
          toState,
          player,
          isFallbackTransition: true
        });
      });
    }
  }
  removeNode(element, context) {
    const engine = this._engine;
    if (element.childElementCount) {
      this._signalRemovalForInnerTriggers(element, context);
    }
    if (this.triggerLeaveAnimation(element, context, true)) return;
    let containsPotentialParentTransition = false;
    if (engine.totalAnimations) {
      const currentPlayers = engine.players.length ? engine.playersByQueriedElement.get(element) : [];
      if (currentPlayers && currentPlayers.length) {
        containsPotentialParentTransition = true;
      } else {
        let parent = element;
        while (parent = parent.parentNode) {
          const triggers = engine.statesByElement.get(parent);
          if (triggers) {
            containsPotentialParentTransition = true;
            break;
          }
        }
      }
    }
    this.prepareLeaveAnimationListeners(element);
    if (containsPotentialParentTransition) {
      engine.markElementAsRemoved(this.id, element, false, context);
    } else {
      const removalFlag = element[REMOVAL_FLAG];
      if (!removalFlag || removalFlag === NULL_REMOVAL_STATE) {
        engine.afterFlush(() => this.clearElementCache(element));
        engine.destroyInnerAnimations(element);
        engine._onRemovalComplete(element, context);
      }
    }
  }
  insertNode(element, parent) {
    addClass(element, this._hostClassName);
  }
  drainQueuedTransitions(microtaskId) {
    const instructions = [];
    this._queue.forEach((entry) => {
      const player = entry.player;
      if (player.destroyed) return;
      const element = entry.element;
      const listeners = this._elementListeners.get(element);
      if (listeners) {
        listeners.forEach((listener) => {
          if (listener.name == entry.triggerName) {
            const baseEvent = makeAnimationEvent(element, entry.triggerName, entry.fromState.value, entry.toState.value);
            baseEvent["_data"] = microtaskId;
            listenOnPlayer(entry.player, listener.phase, baseEvent, listener.callback);
          }
        });
      }
      if (player.markedForDestroy) {
        this._engine.afterFlush(() => {
          player.destroy();
        });
      } else {
        instructions.push(entry);
      }
    });
    this._queue = [];
    return instructions.sort((a, b) => {
      const d0 = a.transition.ast.depCount;
      const d1 = b.transition.ast.depCount;
      if (d0 == 0 || d1 == 0) {
        return d0 - d1;
      }
      return this._engine.driver.containsElement(a.element, b.element) ? 1 : -1;
    });
  }
  destroy(context) {
    this.players.forEach((p) => p.destroy());
    this._signalRemovalForInnerTriggers(this.hostElement, context);
  }
};
var TransitionAnimationEngine = class {
  bodyNode;
  driver;
  _normalizer;
  players = [];
  newHostElements = /* @__PURE__ */ new Map();
  playersByElement = /* @__PURE__ */ new Map();
  playersByQueriedElement = /* @__PURE__ */ new Map();
  statesByElement = /* @__PURE__ */ new Map();
  disabledNodes = /* @__PURE__ */ new Set();
  totalAnimations = 0;
  totalQueuedPlayers = 0;
  _namespaceLookup = {};
  _namespaceList = [];
  _flushFns = [];
  _whenQuietFns = [];
  namespacesByHostElement = /* @__PURE__ */ new Map();
  collectedEnterElements = [];
  collectedLeaveElements = [];
  // this method is designed to be overridden by the code that uses this engine
  onRemovalComplete = (element, context) => {
  };
  /** @internal */
  _onRemovalComplete(element, context) {
    this.onRemovalComplete(element, context);
  }
  constructor(bodyNode, driver, _normalizer) {
    this.bodyNode = bodyNode;
    this.driver = driver;
    this._normalizer = _normalizer;
  }
  get queuedPlayers() {
    const players = [];
    this._namespaceList.forEach((ns) => {
      ns.players.forEach((player) => {
        if (player.queued) {
          players.push(player);
        }
      });
    });
    return players;
  }
  createNamespace(namespaceId, hostElement) {
    const ns = new AnimationTransitionNamespace(namespaceId, hostElement, this);
    if (this.bodyNode && this.driver.containsElement(this.bodyNode, hostElement)) {
      this._balanceNamespaceList(ns, hostElement);
    } else {
      this.newHostElements.set(hostElement, ns);
      this.collectEnterElement(hostElement);
    }
    return this._namespaceLookup[namespaceId] = ns;
  }
  _balanceNamespaceList(ns, hostElement) {
    const namespaceList = this._namespaceList;
    const namespacesByHostElement = this.namespacesByHostElement;
    const limit = namespaceList.length - 1;
    if (limit >= 0) {
      let found = false;
      let ancestor = this.driver.getParentElement(hostElement);
      while (ancestor) {
        const ancestorNs = namespacesByHostElement.get(ancestor);
        if (ancestorNs) {
          const index = namespaceList.indexOf(ancestorNs);
          namespaceList.splice(index + 1, 0, ns);
          found = true;
          break;
        }
        ancestor = this.driver.getParentElement(ancestor);
      }
      if (!found) {
        namespaceList.unshift(ns);
      }
    } else {
      namespaceList.push(ns);
    }
    namespacesByHostElement.set(hostElement, ns);
    return ns;
  }
  register(namespaceId, hostElement) {
    let ns = this._namespaceLookup[namespaceId];
    if (!ns) {
      ns = this.createNamespace(namespaceId, hostElement);
    }
    return ns;
  }
  registerTrigger(namespaceId, name, trigger2) {
    let ns = this._namespaceLookup[namespaceId];
    if (ns && ns.register(name, trigger2)) {
      this.totalAnimations++;
    }
  }
  destroy(namespaceId, context) {
    if (!namespaceId) return;
    this.afterFlush(() => {
    });
    this.afterFlushAnimationsDone(() => {
      const ns = this._fetchNamespace(namespaceId);
      this.namespacesByHostElement.delete(ns.hostElement);
      const index = this._namespaceList.indexOf(ns);
      if (index >= 0) {
        this._namespaceList.splice(index, 1);
      }
      ns.destroy(context);
      delete this._namespaceLookup[namespaceId];
    });
  }
  _fetchNamespace(id) {
    return this._namespaceLookup[id];
  }
  fetchNamespacesByElement(element) {
    const namespaces = /* @__PURE__ */ new Set();
    const elementStates = this.statesByElement.get(element);
    if (elementStates) {
      for (let stateValue of elementStates.values()) {
        if (stateValue.namespaceId) {
          const ns = this._fetchNamespace(stateValue.namespaceId);
          if (ns) {
            namespaces.add(ns);
          }
        }
      }
    }
    return namespaces;
  }
  trigger(namespaceId, element, name, value) {
    if (isElementNode(element)) {
      const ns = this._fetchNamespace(namespaceId);
      if (ns) {
        ns.trigger(element, name, value);
        return true;
      }
    }
    return false;
  }
  insertNode(namespaceId, element, parent, insertBefore) {
    if (!isElementNode(element)) return;
    const details = element[REMOVAL_FLAG];
    if (details && details.setForRemoval) {
      details.setForRemoval = false;
      details.setForMove = true;
      const index = this.collectedLeaveElements.indexOf(element);
      if (index >= 0) {
        this.collectedLeaveElements.splice(index, 1);
      }
    }
    if (namespaceId) {
      const ns = this._fetchNamespace(namespaceId);
      if (ns) {
        ns.insertNode(element, parent);
      }
    }
    if (insertBefore) {
      this.collectEnterElement(element);
    }
  }
  collectEnterElement(element) {
    this.collectedEnterElements.push(element);
  }
  markElementAsDisabled(element, value) {
    if (value) {
      if (!this.disabledNodes.has(element)) {
        this.disabledNodes.add(element);
        addClass(element, DISABLED_CLASSNAME);
      }
    } else if (this.disabledNodes.has(element)) {
      this.disabledNodes.delete(element);
      removeClass(element, DISABLED_CLASSNAME);
    }
  }
  removeNode(namespaceId, element, context) {
    if (isElementNode(element)) {
      const ns = namespaceId ? this._fetchNamespace(namespaceId) : null;
      if (ns) {
        ns.removeNode(element, context);
      } else {
        this.markElementAsRemoved(namespaceId, element, false, context);
      }
      const hostNS = this.namespacesByHostElement.get(element);
      if (hostNS && hostNS.id !== namespaceId) {
        hostNS.removeNode(element, context);
      }
    } else {
      this._onRemovalComplete(element, context);
    }
  }
  markElementAsRemoved(namespaceId, element, hasAnimation, context, previousTriggersValues) {
    this.collectedLeaveElements.push(element);
    element[REMOVAL_FLAG] = {
      namespaceId,
      setForRemoval: context,
      hasAnimation,
      removedBeforeQueried: false,
      previousTriggersValues
    };
  }
  listen(namespaceId, element, name, phase, callback) {
    if (isElementNode(element)) {
      return this._fetchNamespace(namespaceId).listen(element, name, phase, callback);
    }
    return () => {
    };
  }
  _buildInstruction(entry, subTimelines, enterClassName, leaveClassName, skipBuildAst) {
    return entry.transition.build(this.driver, entry.element, entry.fromState.value, entry.toState.value, enterClassName, leaveClassName, entry.fromState.options, entry.toState.options, subTimelines, skipBuildAst);
  }
  destroyInnerAnimations(containerElement) {
    let elements = this.driver.query(containerElement, NG_TRIGGER_SELECTOR, true);
    elements.forEach((element) => this.destroyActiveAnimationsForElement(element));
    if (this.playersByQueriedElement.size == 0) return;
    elements = this.driver.query(containerElement, NG_ANIMATING_SELECTOR, true);
    elements.forEach((element) => this.finishActiveQueriedAnimationOnElement(element));
  }
  destroyActiveAnimationsForElement(element) {
    const players = this.playersByElement.get(element);
    if (players) {
      players.forEach((player) => {
        if (player.queued) {
          player.markedForDestroy = true;
        } else {
          player.destroy();
        }
      });
    }
  }
  finishActiveQueriedAnimationOnElement(element) {
    const players = this.playersByQueriedElement.get(element);
    if (players) {
      players.forEach((player) => player.finish());
    }
  }
  whenRenderingDone() {
    return new Promise((resolve) => {
      if (this.players.length) {
        return optimizeGroupPlayer(this.players).onDone(() => resolve());
      } else {
        resolve();
      }
    });
  }
  processLeaveNode(element) {
    const details = element[REMOVAL_FLAG];
    if (details && details.setForRemoval) {
      element[REMOVAL_FLAG] = NULL_REMOVAL_STATE;
      if (details.namespaceId) {
        this.destroyInnerAnimations(element);
        const ns = this._fetchNamespace(details.namespaceId);
        if (ns) {
          ns.clearElementCache(element);
        }
      }
      this._onRemovalComplete(element, details.setForRemoval);
    }
    if (element.classList?.contains(DISABLED_CLASSNAME)) {
      this.markElementAsDisabled(element, false);
    }
    this.driver.query(element, DISABLED_SELECTOR, true).forEach((node) => {
      this.markElementAsDisabled(node, false);
    });
  }
  flush(microtaskId = -1) {
    let players = [];
    if (this.newHostElements.size) {
      this.newHostElements.forEach((ns, element) => this._balanceNamespaceList(ns, element));
      this.newHostElements.clear();
    }
    if (this.totalAnimations && this.collectedEnterElements.length) {
      for (let i = 0; i < this.collectedEnterElements.length; i++) {
        const elm = this.collectedEnterElements[i];
        addClass(elm, STAR_CLASSNAME);
      }
    }
    if (this._namespaceList.length && (this.totalQueuedPlayers || this.collectedLeaveElements.length)) {
      const cleanupFns = [];
      try {
        players = this._flushAnimations(cleanupFns, microtaskId);
      } finally {
        for (let i = 0; i < cleanupFns.length; i++) {
          cleanupFns[i]();
        }
      }
    } else {
      for (let i = 0; i < this.collectedLeaveElements.length; i++) {
        const element = this.collectedLeaveElements[i];
        this.processLeaveNode(element);
      }
    }
    this.totalQueuedPlayers = 0;
    this.collectedEnterElements.length = 0;
    this.collectedLeaveElements.length = 0;
    this._flushFns.forEach((fn) => fn());
    this._flushFns = [];
    if (this._whenQuietFns.length) {
      const quietFns = this._whenQuietFns;
      this._whenQuietFns = [];
      if (players.length) {
        optimizeGroupPlayer(players).onDone(() => {
          quietFns.forEach((fn) => fn());
        });
      } else {
        quietFns.forEach((fn) => fn());
      }
    }
  }
  reportError(errors) {
    throw triggerTransitionsFailed(errors);
  }
  _flushAnimations(cleanupFns, microtaskId) {
    const subTimelines = new ElementInstructionMap();
    const skippedPlayers = [];
    const skippedPlayersMap = /* @__PURE__ */ new Map();
    const queuedInstructions = [];
    const queriedElements = /* @__PURE__ */ new Map();
    const allPreStyleElements = /* @__PURE__ */ new Map();
    const allPostStyleElements = /* @__PURE__ */ new Map();
    const disabledElementsSet = /* @__PURE__ */ new Set();
    this.disabledNodes.forEach((node) => {
      disabledElementsSet.add(node);
      const nodesThatAreDisabled = this.driver.query(node, QUEUED_SELECTOR, true);
      for (let i2 = 0; i2 < nodesThatAreDisabled.length; i2++) {
        disabledElementsSet.add(nodesThatAreDisabled[i2]);
      }
    });
    const bodyNode = this.bodyNode;
    const allTriggerElements = Array.from(this.statesByElement.keys());
    const enterNodeMap = buildRootMap(allTriggerElements, this.collectedEnterElements);
    const enterNodeMapIds = /* @__PURE__ */ new Map();
    let i = 0;
    enterNodeMap.forEach((nodes, root) => {
      const className = ENTER_CLASSNAME + i++;
      enterNodeMapIds.set(root, className);
      nodes.forEach((node) => addClass(node, className));
    });
    const allLeaveNodes = [];
    const mergedLeaveNodes = /* @__PURE__ */ new Set();
    const leaveNodesWithoutAnimations = /* @__PURE__ */ new Set();
    for (let i2 = 0; i2 < this.collectedLeaveElements.length; i2++) {
      const element = this.collectedLeaveElements[i2];
      const details = element[REMOVAL_FLAG];
      if (details && details.setForRemoval) {
        allLeaveNodes.push(element);
        mergedLeaveNodes.add(element);
        if (details.hasAnimation) {
          this.driver.query(element, STAR_SELECTOR, true).forEach((elm) => mergedLeaveNodes.add(elm));
        } else {
          leaveNodesWithoutAnimations.add(element);
        }
      }
    }
    const leaveNodeMapIds = /* @__PURE__ */ new Map();
    const leaveNodeMap = buildRootMap(allTriggerElements, Array.from(mergedLeaveNodes));
    leaveNodeMap.forEach((nodes, root) => {
      const className = LEAVE_CLASSNAME + i++;
      leaveNodeMapIds.set(root, className);
      nodes.forEach((node) => addClass(node, className));
    });
    cleanupFns.push(() => {
      enterNodeMap.forEach((nodes, root) => {
        const className = enterNodeMapIds.get(root);
        nodes.forEach((node) => removeClass(node, className));
      });
      leaveNodeMap.forEach((nodes, root) => {
        const className = leaveNodeMapIds.get(root);
        nodes.forEach((node) => removeClass(node, className));
      });
      allLeaveNodes.forEach((element) => {
        this.processLeaveNode(element);
      });
    });
    const allPlayers = [];
    const erroneousTransitions = [];
    for (let i2 = this._namespaceList.length - 1; i2 >= 0; i2--) {
      const ns = this._namespaceList[i2];
      ns.drainQueuedTransitions(microtaskId).forEach((entry) => {
        const player = entry.player;
        const element = entry.element;
        allPlayers.push(player);
        if (this.collectedEnterElements.length) {
          const details = element[REMOVAL_FLAG];
          if (details && details.setForMove) {
            if (details.previousTriggersValues && details.previousTriggersValues.has(entry.triggerName)) {
              const previousValue = details.previousTriggersValues.get(entry.triggerName);
              const triggersWithStates = this.statesByElement.get(entry.element);
              if (triggersWithStates && triggersWithStates.has(entry.triggerName)) {
                const state2 = triggersWithStates.get(entry.triggerName);
                state2.value = previousValue;
                triggersWithStates.set(entry.triggerName, state2);
              }
            }
            player.destroy();
            return;
          }
        }
        const nodeIsOrphaned = !bodyNode || !this.driver.containsElement(bodyNode, element);
        const leaveClassName = leaveNodeMapIds.get(element);
        const enterClassName = enterNodeMapIds.get(element);
        const instruction = this._buildInstruction(entry, subTimelines, enterClassName, leaveClassName, nodeIsOrphaned);
        if (instruction.errors && instruction.errors.length) {
          erroneousTransitions.push(instruction);
          return;
        }
        if (nodeIsOrphaned) {
          player.onStart(() => eraseStyles(element, instruction.fromStyles));
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          skippedPlayers.push(player);
          return;
        }
        if (entry.isFallbackTransition) {
          player.onStart(() => eraseStyles(element, instruction.fromStyles));
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          skippedPlayers.push(player);
          return;
        }
        const timelines = [];
        instruction.timelines.forEach((tl) => {
          tl.stretchStartingKeyframe = true;
          if (!this.disabledNodes.has(tl.element)) {
            timelines.push(tl);
          }
        });
        instruction.timelines = timelines;
        subTimelines.append(element, instruction.timelines);
        const tuple = {
          instruction,
          player,
          element
        };
        queuedInstructions.push(tuple);
        instruction.queriedElements.forEach((element2) => getOrSetDefaultValue(queriedElements, element2, []).push(player));
        instruction.preStyleProps.forEach((stringMap, element2) => {
          if (stringMap.size) {
            let setVal = allPreStyleElements.get(element2);
            if (!setVal) {
              allPreStyleElements.set(element2, setVal = /* @__PURE__ */ new Set());
            }
            stringMap.forEach((_, prop) => setVal.add(prop));
          }
        });
        instruction.postStyleProps.forEach((stringMap, element2) => {
          let setVal = allPostStyleElements.get(element2);
          if (!setVal) {
            allPostStyleElements.set(element2, setVal = /* @__PURE__ */ new Set());
          }
          stringMap.forEach((_, prop) => setVal.add(prop));
        });
      });
    }
    if (erroneousTransitions.length) {
      const errors = [];
      erroneousTransitions.forEach((instruction) => {
        errors.push(transitionFailed(instruction.triggerName, instruction.errors));
      });
      allPlayers.forEach((player) => player.destroy());
      this.reportError(errors);
    }
    const allPreviousPlayersMap = /* @__PURE__ */ new Map();
    const animationElementMap = /* @__PURE__ */ new Map();
    queuedInstructions.forEach((entry) => {
      const element = entry.element;
      if (subTimelines.has(element)) {
        animationElementMap.set(element, element);
        this._beforeAnimationBuild(entry.player.namespaceId, entry.instruction, allPreviousPlayersMap);
      }
    });
    skippedPlayers.forEach((player) => {
      const element = player.element;
      const previousPlayers = this._getPreviousPlayers(element, false, player.namespaceId, player.triggerName, null);
      previousPlayers.forEach((prevPlayer) => {
        getOrSetDefaultValue(allPreviousPlayersMap, element, []).push(prevPlayer);
        prevPlayer.destroy();
      });
    });
    const replaceNodes = allLeaveNodes.filter((node) => {
      return replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements);
    });
    const postStylesMap = /* @__PURE__ */ new Map();
    const allLeaveQueriedNodes = cloakAndComputeStyles(postStylesMap, this.driver, leaveNodesWithoutAnimations, allPostStyleElements, AUTO_STYLE);
    allLeaveQueriedNodes.forEach((node) => {
      if (replacePostStylesAsPre(node, allPreStyleElements, allPostStyleElements)) {
        replaceNodes.push(node);
      }
    });
    const preStylesMap = /* @__PURE__ */ new Map();
    enterNodeMap.forEach((nodes, root) => {
      cloakAndComputeStyles(preStylesMap, this.driver, new Set(nodes), allPreStyleElements, \u0275PRE_STYLE);
    });
    replaceNodes.forEach((node) => {
      const post = postStylesMap.get(node);
      const pre = preStylesMap.get(node);
      postStylesMap.set(node, new Map([...post?.entries() ?? [], ...pre?.entries() ?? []]));
    });
    const rootPlayers = [];
    const subPlayers = [];
    const NO_PARENT_ANIMATION_ELEMENT_DETECTED = {};
    queuedInstructions.forEach((entry) => {
      const {
        element,
        player,
        instruction
      } = entry;
      if (subTimelines.has(element)) {
        if (disabledElementsSet.has(element)) {
          player.onDestroy(() => setStyles(element, instruction.toStyles));
          player.disabled = true;
          player.overrideTotalTime(instruction.totalTime);
          skippedPlayers.push(player);
          return;
        }
        let parentWithAnimation = NO_PARENT_ANIMATION_ELEMENT_DETECTED;
        if (animationElementMap.size > 1) {
          let elm = element;
          const parentsToAdd = [];
          while (elm = elm.parentNode) {
            const detectedParent = animationElementMap.get(elm);
            if (detectedParent) {
              parentWithAnimation = detectedParent;
              break;
            }
            parentsToAdd.push(elm);
          }
          parentsToAdd.forEach((parent) => animationElementMap.set(parent, parentWithAnimation));
        }
        const innerPlayer = this._buildAnimation(player.namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap);
        player.setRealPlayer(innerPlayer);
        if (parentWithAnimation === NO_PARENT_ANIMATION_ELEMENT_DETECTED) {
          rootPlayers.push(player);
        } else {
          const parentPlayers = this.playersByElement.get(parentWithAnimation);
          if (parentPlayers && parentPlayers.length) {
            player.parentPlayer = optimizeGroupPlayer(parentPlayers);
          }
          skippedPlayers.push(player);
        }
      } else {
        eraseStyles(element, instruction.fromStyles);
        player.onDestroy(() => setStyles(element, instruction.toStyles));
        subPlayers.push(player);
        if (disabledElementsSet.has(element)) {
          skippedPlayers.push(player);
        }
      }
    });
    subPlayers.forEach((player) => {
      const playersForElement = skippedPlayersMap.get(player.element);
      if (playersForElement && playersForElement.length) {
        const innerPlayer = optimizeGroupPlayer(playersForElement);
        player.setRealPlayer(innerPlayer);
      }
    });
    skippedPlayers.forEach((player) => {
      if (player.parentPlayer) {
        player.syncPlayerEvents(player.parentPlayer);
      } else {
        player.destroy();
      }
    });
    for (let i2 = 0; i2 < allLeaveNodes.length; i2++) {
      const element = allLeaveNodes[i2];
      const details = element[REMOVAL_FLAG];
      removeClass(element, LEAVE_CLASSNAME);
      if (details && details.hasAnimation) continue;
      let players = [];
      if (queriedElements.size) {
        let queriedPlayerResults = queriedElements.get(element);
        if (queriedPlayerResults && queriedPlayerResults.length) {
          players.push(...queriedPlayerResults);
        }
        let queriedInnerElements = this.driver.query(element, NG_ANIMATING_SELECTOR, true);
        for (let j = 0; j < queriedInnerElements.length; j++) {
          let queriedPlayers = queriedElements.get(queriedInnerElements[j]);
          if (queriedPlayers && queriedPlayers.length) {
            players.push(...queriedPlayers);
          }
        }
      }
      const activePlayers = players.filter((p) => !p.destroyed);
      if (activePlayers.length) {
        removeNodesAfterAnimationDone(this, element, activePlayers);
      } else {
        this.processLeaveNode(element);
      }
    }
    allLeaveNodes.length = 0;
    rootPlayers.forEach((player) => {
      this.players.push(player);
      player.onDone(() => {
        player.destroy();
        const index = this.players.indexOf(player);
        this.players.splice(index, 1);
      });
      player.play();
    });
    return rootPlayers;
  }
  afterFlush(callback) {
    this._flushFns.push(callback);
  }
  afterFlushAnimationsDone(callback) {
    this._whenQuietFns.push(callback);
  }
  _getPreviousPlayers(element, isQueriedElement, namespaceId, triggerName, toStateValue) {
    let players = [];
    if (isQueriedElement) {
      const queriedElementPlayers = this.playersByQueriedElement.get(element);
      if (queriedElementPlayers) {
        players = queriedElementPlayers;
      }
    } else {
      const elementPlayers = this.playersByElement.get(element);
      if (elementPlayers) {
        const isRemovalAnimation = !toStateValue || toStateValue == VOID_VALUE;
        elementPlayers.forEach((player) => {
          if (player.queued) return;
          if (!isRemovalAnimation && player.triggerName != triggerName) return;
          players.push(player);
        });
      }
    }
    if (namespaceId || triggerName) {
      players = players.filter((player) => {
        if (namespaceId && namespaceId != player.namespaceId) return false;
        if (triggerName && triggerName != player.triggerName) return false;
        return true;
      });
    }
    return players;
  }
  _beforeAnimationBuild(namespaceId, instruction, allPreviousPlayersMap) {
    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;
    const targetNameSpaceId = instruction.isRemovalTransition ? void 0 : namespaceId;
    const targetTriggerName = instruction.isRemovalTransition ? void 0 : triggerName;
    for (const timelineInstruction of instruction.timelines) {
      const element = timelineInstruction.element;
      const isQueriedElement = element !== rootElement;
      const players = getOrSetDefaultValue(allPreviousPlayersMap, element, []);
      const previousPlayers = this._getPreviousPlayers(element, isQueriedElement, targetNameSpaceId, targetTriggerName, instruction.toState);
      previousPlayers.forEach((player) => {
        const realPlayer = player.getRealPlayer();
        if (realPlayer.beforeDestroy) {
          realPlayer.beforeDestroy();
        }
        player.destroy();
        players.push(player);
      });
    }
    eraseStyles(rootElement, instruction.fromStyles);
  }
  _buildAnimation(namespaceId, instruction, allPreviousPlayersMap, skippedPlayersMap, preStylesMap, postStylesMap) {
    const triggerName = instruction.triggerName;
    const rootElement = instruction.element;
    const allQueriedPlayers = [];
    const allConsumedElements = /* @__PURE__ */ new Set();
    const allSubElements = /* @__PURE__ */ new Set();
    const allNewPlayers = instruction.timelines.map((timelineInstruction) => {
      const element = timelineInstruction.element;
      allConsumedElements.add(element);
      const details = element[REMOVAL_FLAG];
      if (details && details.removedBeforeQueried) return new NoopAnimationPlayer(timelineInstruction.duration, timelineInstruction.delay);
      const isQueriedElement = element !== rootElement;
      const previousPlayers = flattenGroupPlayers((allPreviousPlayersMap.get(element) || EMPTY_PLAYER_ARRAY).map((p) => p.getRealPlayer())).filter((p) => {
        const pp = p;
        return pp.element ? pp.element === element : false;
      });
      const preStyles = preStylesMap.get(element);
      const postStyles = postStylesMap.get(element);
      const keyframes = normalizeKeyframes$1(this._normalizer, timelineInstruction.keyframes, preStyles, postStyles);
      const player2 = this._buildPlayer(timelineInstruction, keyframes, previousPlayers);
      if (timelineInstruction.subTimeline && skippedPlayersMap) {
        allSubElements.add(element);
      }
      if (isQueriedElement) {
        const wrappedPlayer = new TransitionAnimationPlayer(namespaceId, triggerName, element);
        wrappedPlayer.setRealPlayer(player2);
        allQueriedPlayers.push(wrappedPlayer);
      }
      return player2;
    });
    allQueriedPlayers.forEach((player2) => {
      getOrSetDefaultValue(this.playersByQueriedElement, player2.element, []).push(player2);
      player2.onDone(() => deleteOrUnsetInMap(this.playersByQueriedElement, player2.element, player2));
    });
    allConsumedElements.forEach((element) => addClass(element, NG_ANIMATING_CLASSNAME));
    const player = optimizeGroupPlayer(allNewPlayers);
    player.onDestroy(() => {
      allConsumedElements.forEach((element) => removeClass(element, NG_ANIMATING_CLASSNAME));
      setStyles(rootElement, instruction.toStyles);
    });
    allSubElements.forEach((element) => {
      getOrSetDefaultValue(skippedPlayersMap, element, []).push(player);
    });
    return player;
  }
  _buildPlayer(instruction, keyframes, previousPlayers) {
    if (keyframes.length > 0) {
      return this.driver.animate(instruction.element, keyframes, instruction.duration, instruction.delay, instruction.easing, previousPlayers);
    }
    return new NoopAnimationPlayer(instruction.duration, instruction.delay);
  }
};
var TransitionAnimationPlayer = class {
  namespaceId;
  triggerName;
  element;
  _player = new NoopAnimationPlayer();
  _containsRealPlayer = false;
  _queuedCallbacks = /* @__PURE__ */ new Map();
  destroyed = false;
  parentPlayer = null;
  markedForDestroy = false;
  disabled = false;
  queued = true;
  totalTime = 0;
  constructor(namespaceId, triggerName, element) {
    this.namespaceId = namespaceId;
    this.triggerName = triggerName;
    this.element = element;
  }
  setRealPlayer(player) {
    if (this._containsRealPlayer) return;
    this._player = player;
    this._queuedCallbacks.forEach((callbacks, phase) => {
      callbacks.forEach((callback) => listenOnPlayer(player, phase, void 0, callback));
    });
    this._queuedCallbacks.clear();
    this._containsRealPlayer = true;
    this.overrideTotalTime(player.totalTime);
    this.queued = false;
  }
  getRealPlayer() {
    return this._player;
  }
  overrideTotalTime(totalTime) {
    this.totalTime = totalTime;
  }
  syncPlayerEvents(player) {
    const p = this._player;
    if (p.triggerCallback) {
      player.onStart(() => p.triggerCallback("start"));
    }
    player.onDone(() => this.finish());
    player.onDestroy(() => this.destroy());
  }
  _queueEvent(name, callback) {
    getOrSetDefaultValue(this._queuedCallbacks, name, []).push(callback);
  }
  onDone(fn) {
    if (this.queued) {
      this._queueEvent("done", fn);
    }
    this._player.onDone(fn);
  }
  onStart(fn) {
    if (this.queued) {
      this._queueEvent("start", fn);
    }
    this._player.onStart(fn);
  }
  onDestroy(fn) {
    if (this.queued) {
      this._queueEvent("destroy", fn);
    }
    this._player.onDestroy(fn);
  }
  init() {
    this._player.init();
  }
  hasStarted() {
    return this.queued ? false : this._player.hasStarted();
  }
  play() {
    !this.queued && this._player.play();
  }
  pause() {
    !this.queued && this._player.pause();
  }
  restart() {
    !this.queued && this._player.restart();
  }
  finish() {
    this._player.finish();
  }
  destroy() {
    this.destroyed = true;
    this._player.destroy();
  }
  reset() {
    !this.queued && this._player.reset();
  }
  setPosition(p) {
    if (!this.queued) {
      this._player.setPosition(p);
    }
  }
  getPosition() {
    return this.queued ? 0 : this._player.getPosition();
  }
  /** @internal */
  triggerCallback(phaseName) {
    const p = this._player;
    if (p.triggerCallback) {
      p.triggerCallback(phaseName);
    }
  }
};
function deleteOrUnsetInMap(map2, key, value) {
  let currentValues = map2.get(key);
  if (currentValues) {
    if (currentValues.length) {
      const index = currentValues.indexOf(value);
      currentValues.splice(index, 1);
    }
    if (currentValues.length == 0) {
      map2.delete(key);
    }
  }
  return currentValues;
}
function normalizeTriggerValue(value) {
  return value != null ? value : null;
}
function isElementNode(node) {
  return node && node["nodeType"] === 1;
}
function isTriggerEventValid(eventName) {
  return eventName == "start" || eventName == "done";
}
function cloakElement(element, value) {
  const oldValue = element.style.display;
  element.style.display = value != null ? value : "none";
  return oldValue;
}
function cloakAndComputeStyles(valuesMap, driver, elements, elementPropsMap, defaultStyle) {
  const cloakVals = [];
  elements.forEach((element) => cloakVals.push(cloakElement(element)));
  const failedElements = [];
  elementPropsMap.forEach((props, element) => {
    const styles = /* @__PURE__ */ new Map();
    props.forEach((prop) => {
      const value = driver.computeStyle(element, prop, defaultStyle);
      styles.set(prop, value);
      if (!value || value.length == 0) {
        element[REMOVAL_FLAG] = NULL_REMOVED_QUERIED_STATE;
        failedElements.push(element);
      }
    });
    valuesMap.set(element, styles);
  });
  let i = 0;
  elements.forEach((element) => cloakElement(element, cloakVals[i++]));
  return failedElements;
}
function buildRootMap(roots, nodes) {
  const rootMap = /* @__PURE__ */ new Map();
  roots.forEach((root) => rootMap.set(root, []));
  if (nodes.length == 0) return rootMap;
  const NULL_NODE = 1;
  const nodeSet = new Set(nodes);
  const localRootMap = /* @__PURE__ */ new Map();
  function getRoot(node) {
    if (!node) return NULL_NODE;
    let root = localRootMap.get(node);
    if (root) return root;
    const parent = node.parentNode;
    if (rootMap.has(parent)) {
      root = parent;
    } else if (nodeSet.has(parent)) {
      root = NULL_NODE;
    } else {
      root = getRoot(parent);
    }
    localRootMap.set(node, root);
    return root;
  }
  nodes.forEach((node) => {
    const root = getRoot(node);
    if (root !== NULL_NODE) {
      rootMap.get(root).push(node);
    }
  });
  return rootMap;
}
function addClass(element, className) {
  element.classList?.add(className);
}
function removeClass(element, className) {
  element.classList?.remove(className);
}
function removeNodesAfterAnimationDone(engine, element, players) {
  optimizeGroupPlayer(players).onDone(() => engine.processLeaveNode(element));
}
function flattenGroupPlayers(players) {
  const finalPlayers = [];
  _flattenGroupPlayersRecur(players, finalPlayers);
  return finalPlayers;
}
function _flattenGroupPlayersRecur(players, finalPlayers) {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    if (player instanceof AnimationGroupPlayer) {
      _flattenGroupPlayersRecur(player.players, finalPlayers);
    } else {
      finalPlayers.push(player);
    }
  }
}
function objEquals(a, b) {
  const k1 = Object.keys(a);
  const k2 = Object.keys(b);
  if (k1.length != k2.length) return false;
  for (let i = 0; i < k1.length; i++) {
    const prop = k1[i];
    if (!b.hasOwnProperty(prop) || a[prop] !== b[prop]) return false;
  }
  return true;
}
function replacePostStylesAsPre(element, allPreStyleElements, allPostStyleElements) {
  const postEntry = allPostStyleElements.get(element);
  if (!postEntry) return false;
  let preEntry = allPreStyleElements.get(element);
  if (preEntry) {
    postEntry.forEach((data) => preEntry.add(data));
  } else {
    allPreStyleElements.set(element, postEntry);
  }
  allPostStyleElements.delete(element);
  return true;
}
var AnimationEngine = class {
  _driver;
  _normalizer;
  _transitionEngine;
  _timelineEngine;
  _triggerCache = {};
  // this method is designed to be overridden by the code that uses this engine
  onRemovalComplete = (element, context) => {
  };
  constructor(doc, _driver, _normalizer) {
    this._driver = _driver;
    this._normalizer = _normalizer;
    this._transitionEngine = new TransitionAnimationEngine(doc.body, _driver, _normalizer);
    this._timelineEngine = new TimelineAnimationEngine(doc.body, _driver, _normalizer);
    this._transitionEngine.onRemovalComplete = (element, context) => this.onRemovalComplete(element, context);
  }
  registerTrigger(componentId, namespaceId, hostElement, name, metadata) {
    const cacheKey = componentId + "-" + name;
    let trigger2 = this._triggerCache[cacheKey];
    if (!trigger2) {
      const errors = [];
      const warnings = [];
      const ast = buildAnimationAst(this._driver, metadata, errors, warnings);
      if (errors.length) {
        throw triggerBuildFailed(name, errors);
      }
      if (typeof ngDevMode === "undefined" || ngDevMode) {
        if (warnings.length) {
          warnTriggerBuild(name, warnings);
        }
      }
      trigger2 = buildTrigger(name, ast, this._normalizer);
      this._triggerCache[cacheKey] = trigger2;
    }
    this._transitionEngine.registerTrigger(namespaceId, name, trigger2);
  }
  register(namespaceId, hostElement) {
    this._transitionEngine.register(namespaceId, hostElement);
  }
  destroy(namespaceId, context) {
    this._transitionEngine.destroy(namespaceId, context);
  }
  onInsert(namespaceId, element, parent, insertBefore) {
    this._transitionEngine.insertNode(namespaceId, element, parent, insertBefore);
  }
  onRemove(namespaceId, element, context) {
    this._transitionEngine.removeNode(namespaceId, element, context);
  }
  disableAnimations(element, disable) {
    this._transitionEngine.markElementAsDisabled(element, disable);
  }
  process(namespaceId, element, property, value) {
    if (property.charAt(0) == "@") {
      const [id, action] = parseTimelineCommand(property);
      const args = value;
      this._timelineEngine.command(id, element, action, args);
    } else {
      this._transitionEngine.trigger(namespaceId, element, property, value);
    }
  }
  listen(namespaceId, element, eventName, eventPhase, callback) {
    if (eventName.charAt(0) == "@") {
      const [id, action] = parseTimelineCommand(eventName);
      return this._timelineEngine.listen(id, element, action, callback);
    }
    return this._transitionEngine.listen(namespaceId, element, eventName, eventPhase, callback);
  }
  flush(microtaskId = -1) {
    this._transitionEngine.flush(microtaskId);
  }
  get players() {
    return [...this._transitionEngine.players, ...this._timelineEngine.players];
  }
  whenRenderingDone() {
    return this._transitionEngine.whenRenderingDone();
  }
  afterFlushAnimationsDone(cb) {
    this._transitionEngine.afterFlushAnimationsDone(cb);
  }
};
function packageNonAnimatableStyles(element, styles) {
  let startStyles = null;
  let endStyles = null;
  if (Array.isArray(styles) && styles.length) {
    startStyles = filterNonAnimatableStyles(styles[0]);
    if (styles.length > 1) {
      endStyles = filterNonAnimatableStyles(styles[styles.length - 1]);
    }
  } else if (styles instanceof Map) {
    startStyles = filterNonAnimatableStyles(styles);
  }
  return startStyles || endStyles ? new SpecialCasedStyles(element, startStyles, endStyles) : null;
}
var SpecialCasedStyles = class _SpecialCasedStyles {
  _element;
  _startStyles;
  _endStyles;
  static initialStylesByElement = /* @__PURE__ */ new WeakMap();
  _state = 0;
  _initialStyles;
  constructor(_element, _startStyles, _endStyles) {
    this._element = _element;
    this._startStyles = _startStyles;
    this._endStyles = _endStyles;
    let initialStyles = _SpecialCasedStyles.initialStylesByElement.get(_element);
    if (!initialStyles) {
      _SpecialCasedStyles.initialStylesByElement.set(_element, initialStyles = /* @__PURE__ */ new Map());
    }
    this._initialStyles = initialStyles;
  }
  start() {
    if (this._state < 1) {
      if (this._startStyles) {
        setStyles(this._element, this._startStyles, this._initialStyles);
      }
      this._state = 1;
    }
  }
  finish() {
    this.start();
    if (this._state < 2) {
      setStyles(this._element, this._initialStyles);
      if (this._endStyles) {
        setStyles(this._element, this._endStyles);
        this._endStyles = null;
      }
      this._state = 1;
    }
  }
  destroy() {
    this.finish();
    if (this._state < 3) {
      _SpecialCasedStyles.initialStylesByElement.delete(this._element);
      if (this._startStyles) {
        eraseStyles(this._element, this._startStyles);
        this._endStyles = null;
      }
      if (this._endStyles) {
        eraseStyles(this._element, this._endStyles);
        this._endStyles = null;
      }
      setStyles(this._element, this._initialStyles);
      this._state = 3;
    }
  }
};
function filterNonAnimatableStyles(styles) {
  let result = null;
  styles.forEach((val, prop) => {
    if (isNonAnimatableStyle(prop)) {
      result = result || /* @__PURE__ */ new Map();
      result.set(prop, val);
    }
  });
  return result;
}
function isNonAnimatableStyle(prop) {
  return prop === "display" || prop === "position";
}
var WebAnimationsPlayer = class {
  element;
  keyframes;
  options;
  _specialStyles;
  _onDoneFns = [];
  _onStartFns = [];
  _onDestroyFns = [];
  _duration;
  _delay;
  _initialized = false;
  _finished = false;
  _started = false;
  _destroyed = false;
  _finalKeyframe;
  // the following original fns are persistent copies of the _onStartFns and _onDoneFns
  // and are used to reset the fns to their original values upon reset()
  // (since the _onStartFns and _onDoneFns get deleted after they are called)
  _originalOnDoneFns = [];
  _originalOnStartFns = [];
  // using non-null assertion because it's re(set) by init();
  domPlayer;
  time = 0;
  parentPlayer = null;
  currentSnapshot = /* @__PURE__ */ new Map();
  constructor(element, keyframes, options, _specialStyles) {
    this.element = element;
    this.keyframes = keyframes;
    this.options = options;
    this._specialStyles = _specialStyles;
    this._duration = options["duration"];
    this._delay = options["delay"] || 0;
    this.time = this._duration + this._delay;
  }
  _onFinish() {
    if (!this._finished) {
      this._finished = true;
      this._onDoneFns.forEach((fn) => fn());
      this._onDoneFns = [];
    }
  }
  init() {
    this._buildPlayer();
    this._preparePlayerBeforeStart();
  }
  _buildPlayer() {
    if (this._initialized) return;
    this._initialized = true;
    const keyframes = this.keyframes;
    this.domPlayer = this._triggerWebAnimation(this.element, keyframes, this.options);
    this._finalKeyframe = keyframes.length ? keyframes[keyframes.length - 1] : /* @__PURE__ */ new Map();
    const onFinish = () => this._onFinish();
    this.domPlayer.addEventListener("finish", onFinish);
    this.onDestroy(() => {
      this.domPlayer.removeEventListener("finish", onFinish);
    });
  }
  _preparePlayerBeforeStart() {
    if (this._delay) {
      this._resetDomPlayerState();
    } else {
      this.domPlayer.pause();
    }
  }
  _convertKeyframesToObject(keyframes) {
    const kfs = [];
    keyframes.forEach((frame) => {
      kfs.push(Object.fromEntries(frame));
    });
    return kfs;
  }
  /** @internal */
  _triggerWebAnimation(element, keyframes, options) {
    return element.animate(this._convertKeyframesToObject(keyframes), options);
  }
  onStart(fn) {
    this._originalOnStartFns.push(fn);
    this._onStartFns.push(fn);
  }
  onDone(fn) {
    this._originalOnDoneFns.push(fn);
    this._onDoneFns.push(fn);
  }
  onDestroy(fn) {
    this._onDestroyFns.push(fn);
  }
  play() {
    this._buildPlayer();
    if (!this.hasStarted()) {
      this._onStartFns.forEach((fn) => fn());
      this._onStartFns = [];
      this._started = true;
      if (this._specialStyles) {
        this._specialStyles.start();
      }
    }
    this.domPlayer.play();
  }
  pause() {
    this.init();
    this.domPlayer.pause();
  }
  finish() {
    this.init();
    if (this._specialStyles) {
      this._specialStyles.finish();
    }
    this._onFinish();
    this.domPlayer.finish();
  }
  reset() {
    this._resetDomPlayerState();
    this._destroyed = false;
    this._finished = false;
    this._started = false;
    this._onStartFns = this._originalOnStartFns;
    this._onDoneFns = this._originalOnDoneFns;
  }
  _resetDomPlayerState() {
    if (this.domPlayer) {
      this.domPlayer.cancel();
    }
  }
  restart() {
    this.reset();
    this.play();
  }
  hasStarted() {
    return this._started;
  }
  destroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this._resetDomPlayerState();
      this._onFinish();
      if (this._specialStyles) {
        this._specialStyles.destroy();
      }
      this._onDestroyFns.forEach((fn) => fn());
      this._onDestroyFns = [];
    }
  }
  setPosition(p) {
    if (this.domPlayer === void 0) {
      this.init();
    }
    this.domPlayer.currentTime = p * this.time;
  }
  getPosition() {
    return +(this.domPlayer.currentTime ?? 0) / this.time;
  }
  get totalTime() {
    return this._delay + this._duration;
  }
  beforeDestroy() {
    const styles = /* @__PURE__ */ new Map();
    if (this.hasStarted()) {
      const finalKeyframe = this._finalKeyframe;
      finalKeyframe.forEach((val, prop) => {
        if (prop !== "offset") {
          styles.set(prop, this._finished ? val : computeStyle(this.element, prop));
        }
      });
    }
    this.currentSnapshot = styles;
  }
  /** @internal */
  triggerCallback(phaseName) {
    const methods = phaseName === "start" ? this._onStartFns : this._onDoneFns;
    methods.forEach((fn) => fn());
    methods.length = 0;
  }
};
var WebAnimationsDriver = class {
  validateStyleProperty(prop) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      return validateStyleProperty(prop);
    }
    return true;
  }
  validateAnimatableStyleProperty(prop) {
    if (typeof ngDevMode === "undefined" || ngDevMode) {
      const cssProp = camelCaseToDashCase(prop);
      return validateWebAnimatableStyleProperty(cssProp);
    }
    return true;
  }
  containsElement(elm1, elm2) {
    return containsElement(elm1, elm2);
  }
  getParentElement(element) {
    return getParentElement(element);
  }
  query(element, selector, multi) {
    return invokeQuery(element, selector, multi);
  }
  computeStyle(element, prop, defaultValue) {
    return computeStyle(element, prop);
  }
  animate(element, keyframes, duration, delay, easing, previousPlayers = []) {
    const fill = delay == 0 ? "both" : "forwards";
    const playerOptions = {
      duration,
      delay,
      fill
    };
    if (easing) {
      playerOptions["easing"] = easing;
    }
    const previousStyles = /* @__PURE__ */ new Map();
    const previousWebAnimationPlayers = previousPlayers.filter((player) => player instanceof WebAnimationsPlayer);
    if (allowPreviousPlayerStylesMerge(duration, delay)) {
      previousWebAnimationPlayers.forEach((player) => {
        player.currentSnapshot.forEach((val, prop) => previousStyles.set(prop, val));
      });
    }
    let _keyframes = normalizeKeyframes(keyframes).map((styles) => new Map(styles));
    _keyframes = balancePreviousStylesIntoKeyframes(element, _keyframes, previousStyles);
    const specialStyles = packageNonAnimatableStyles(element, _keyframes);
    return new WebAnimationsPlayer(element, _keyframes, playerOptions, specialStyles);
  }
};
var ANIMATION_PREFIX = "@";
var DISABLE_ANIMATIONS_FLAG = "@.disabled";
var BaseAnimationRenderer = class {
  namespaceId;
  delegate;
  engine;
  _onDestroy;
  // We need to explicitly type this property because of an api-extractor bug
  // See https://github.com/microsoft/rushstack/issues/4390
  \u0275type = 0;
  constructor(namespaceId, delegate, engine, _onDestroy) {
    this.namespaceId = namespaceId;
    this.delegate = delegate;
    this.engine = engine;
    this._onDestroy = _onDestroy;
  }
  get data() {
    return this.delegate.data;
  }
  destroyNode(node) {
    this.delegate.destroyNode?.(node);
  }
  destroy() {
    this.engine.destroy(this.namespaceId, this.delegate);
    this.engine.afterFlushAnimationsDone(() => {
      queueMicrotask(() => {
        this.delegate.destroy();
      });
    });
    this._onDestroy?.();
  }
  createElement(name, namespace) {
    return this.delegate.createElement(name, namespace);
  }
  createComment(value) {
    return this.delegate.createComment(value);
  }
  createText(value) {
    return this.delegate.createText(value);
  }
  appendChild(parent, newChild) {
    this.delegate.appendChild(parent, newChild);
    this.engine.onInsert(this.namespaceId, newChild, parent, false);
  }
  insertBefore(parent, newChild, refChild, isMove = true) {
    this.delegate.insertBefore(parent, newChild, refChild);
    this.engine.onInsert(this.namespaceId, newChild, parent, isMove);
  }
  removeChild(parent, oldChild, isHostElement) {
    if (this.parentNode(oldChild)) {
      this.engine.onRemove(this.namespaceId, oldChild, this.delegate);
    }
  }
  selectRootElement(selectorOrNode, preserveContent) {
    return this.delegate.selectRootElement(selectorOrNode, preserveContent);
  }
  parentNode(node) {
    return this.delegate.parentNode(node);
  }
  nextSibling(node) {
    return this.delegate.nextSibling(node);
  }
  setAttribute(el, name, value, namespace) {
    this.delegate.setAttribute(el, name, value, namespace);
  }
  removeAttribute(el, name, namespace) {
    this.delegate.removeAttribute(el, name, namespace);
  }
  addClass(el, name) {
    this.delegate.addClass(el, name);
  }
  removeClass(el, name) {
    this.delegate.removeClass(el, name);
  }
  setStyle(el, style2, value, flags) {
    this.delegate.setStyle(el, style2, value, flags);
  }
  removeStyle(el, style2, flags) {
    this.delegate.removeStyle(el, style2, flags);
  }
  setProperty(el, name, value) {
    if (name.charAt(0) == ANIMATION_PREFIX && name == DISABLE_ANIMATIONS_FLAG) {
      this.disableAnimations(el, !!value);
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }
  setValue(node, value) {
    this.delegate.setValue(node, value);
  }
  listen(target, eventName, callback, options) {
    return this.delegate.listen(target, eventName, callback, options);
  }
  disableAnimations(element, value) {
    this.engine.disableAnimations(element, value);
  }
};
var AnimationRenderer = class extends BaseAnimationRenderer {
  factory;
  constructor(factory, namespaceId, delegate, engine, onDestroy) {
    super(namespaceId, delegate, engine, onDestroy);
    this.factory = factory;
    this.namespaceId = namespaceId;
  }
  setProperty(el, name, value) {
    if (name.charAt(0) == ANIMATION_PREFIX) {
      if (name.charAt(1) == "." && name == DISABLE_ANIMATIONS_FLAG) {
        value = value === void 0 ? true : !!value;
        this.disableAnimations(el, value);
      } else {
        this.engine.process(this.namespaceId, el, name.slice(1), value);
      }
    } else {
      this.delegate.setProperty(el, name, value);
    }
  }
  listen(target, eventName, callback, options) {
    if (eventName.charAt(0) == ANIMATION_PREFIX) {
      const element = resolveElementFromTarget(target);
      let name = eventName.slice(1);
      let phase = "";
      if (name.charAt(0) != ANIMATION_PREFIX) {
        [name, phase] = parseTriggerCallbackName(name);
      }
      return this.engine.listen(this.namespaceId, element, name, phase, (event) => {
        const countId = event["_data"] || -1;
        this.factory.scheduleListenerCallback(countId, callback, event);
      });
    }
    return this.delegate.listen(target, eventName, callback, options);
  }
};
function resolveElementFromTarget(target) {
  switch (target) {
    case "body":
      return document.body;
    case "document":
      return document;
    case "window":
      return window;
    default:
      return target;
  }
}
function parseTriggerCallbackName(triggerName) {
  const dotIndex = triggerName.indexOf(".");
  const trigger2 = triggerName.substring(0, dotIndex);
  const phase = triggerName.slice(dotIndex + 1);
  return [trigger2, phase];
}
var AnimationRendererFactory = class {
  delegate;
  engine;
  _zone;
  _currentId = 0;
  _microtaskId = 1;
  _animationCallbacksBuffer = [];
  _rendererCache = /* @__PURE__ */ new Map();
  _cdRecurDepth = 0;
  constructor(delegate, engine, _zone) {
    this.delegate = delegate;
    this.engine = engine;
    this._zone = _zone;
    engine.onRemovalComplete = (element, delegate2) => {
      delegate2?.removeChild(null, element);
    };
  }
  createRenderer(hostElement, type) {
    const EMPTY_NAMESPACE_ID = "";
    const delegate = this.delegate.createRenderer(hostElement, type);
    if (!hostElement || !type?.data?.["animation"]) {
      const cache = this._rendererCache;
      let renderer = cache.get(delegate);
      if (!renderer) {
        const onRendererDestroy = () => cache.delete(delegate);
        renderer = new BaseAnimationRenderer(EMPTY_NAMESPACE_ID, delegate, this.engine, onRendererDestroy);
        cache.set(delegate, renderer);
      }
      return renderer;
    }
    const componentId = type.id;
    const namespaceId = type.id + "-" + this._currentId;
    this._currentId++;
    this.engine.register(namespaceId, hostElement);
    const registerTrigger = (trigger2) => {
      if (Array.isArray(trigger2)) {
        trigger2.forEach(registerTrigger);
      } else {
        this.engine.registerTrigger(componentId, namespaceId, hostElement, trigger2.name, trigger2);
      }
    };
    const animationTriggers = type.data["animation"];
    animationTriggers.forEach(registerTrigger);
    return new AnimationRenderer(this, namespaceId, delegate, this.engine);
  }
  begin() {
    this._cdRecurDepth++;
    if (this.delegate.begin) {
      this.delegate.begin();
    }
  }
  _scheduleCountTask() {
    queueMicrotask(() => {
      this._microtaskId++;
    });
  }
  /** @internal */
  scheduleListenerCallback(count, fn, data) {
    if (count >= 0 && count < this._microtaskId) {
      this._zone.run(() => fn(data));
      return;
    }
    const animationCallbacksBuffer = this._animationCallbacksBuffer;
    if (animationCallbacksBuffer.length == 0) {
      queueMicrotask(() => {
        this._zone.run(() => {
          animationCallbacksBuffer.forEach((tuple) => {
            const [fn2, data2] = tuple;
            fn2(data2);
          });
          this._animationCallbacksBuffer = [];
        });
      });
    }
    animationCallbacksBuffer.push([fn, data]);
  }
  end() {
    this._cdRecurDepth--;
    if (this._cdRecurDepth == 0) {
      this._zone.runOutsideAngular(() => {
        this._scheduleCountTask();
        this.engine.flush(this._microtaskId);
      });
    }
    if (this.delegate.end) {
      this.delegate.end();
    }
  }
  whenRenderingDone() {
    return this.engine.whenRenderingDone();
  }
  /**
   * Used during HMR to clear any cached data about a component.
   * @param componentId ID of the component that is being replaced.
   */
  componentReplaced(componentId) {
    this.engine.flush();
    this.delegate.componentReplaced?.(componentId);
  }
};

// node_modules/@angular/platform-browser/fesm2022/animations.mjs
var InjectableAnimationEngine = class _InjectableAnimationEngine extends AnimationEngine {
  // The `ApplicationRef` is injected here explicitly to force the dependency ordering.
  // Since the `ApplicationRef` should be created earlier before the `AnimationEngine`, they
  // both have `ngOnDestroy` hooks and `flush()` must be called after all views are destroyed.
  constructor(doc, driver, normalizer) {
    super(doc, driver, normalizer);
  }
  ngOnDestroy() {
    this.flush();
  }
  static \u0275fac = function InjectableAnimationEngine_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _InjectableAnimationEngine)(\u0275\u0275inject(DOCUMENT), \u0275\u0275inject(AnimationDriver), \u0275\u0275inject(AnimationStyleNormalizer));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _InjectableAnimationEngine,
    factory: _InjectableAnimationEngine.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InjectableAnimationEngine, [{
    type: Injectable
  }], () => [{
    type: Document,
    decorators: [{
      type: Inject,
      args: [DOCUMENT]
    }]
  }, {
    type: AnimationDriver
  }, {
    type: AnimationStyleNormalizer
  }], null);
})();
function instantiateDefaultStyleNormalizer() {
  return new WebAnimationsStyleNormalizer();
}
function instantiateRendererFactory(renderer, engine, zone) {
  return new AnimationRendererFactory(renderer, engine, zone);
}
var SHARED_ANIMATION_PROVIDERS = [{
  provide: AnimationStyleNormalizer,
  useFactory: instantiateDefaultStyleNormalizer
}, {
  provide: AnimationEngine,
  useClass: InjectableAnimationEngine
}, {
  provide: RendererFactory2,
  useFactory: instantiateRendererFactory,
  deps: [DomRendererFactory2, AnimationEngine, NgZone]
}];
var BROWSER_NOOP_ANIMATIONS_PROVIDERS = [{
  provide: AnimationDriver,
  useClass: NoopAnimationDriver
}, {
  provide: ANIMATION_MODULE_TYPE,
  useValue: "NoopAnimations"
}, ...SHARED_ANIMATION_PROVIDERS];
var BROWSER_ANIMATIONS_PROVIDERS = [
  // Note: the `ngServerMode` happen inside factories to give the variable time to initialize.
  {
    provide: AnimationDriver,
    useFactory: () => false ? new NoopAnimationDriver() : new WebAnimationsDriver()
  },
  {
    provide: ANIMATION_MODULE_TYPE,
    useFactory: () => false ? "NoopAnimations" : "BrowserAnimations"
  },
  ...SHARED_ANIMATION_PROVIDERS
];
var BrowserAnimationsModule = class _BrowserAnimationsModule {
  /**
   * Configures the module based on the specified object.
   *
   * @param config Object used to configure the behavior of the `BrowserAnimationsModule`.
   * @see {@link BrowserAnimationsModuleConfig}
   *
   * @usageNotes
   * When registering the `BrowserAnimationsModule`, you can use the `withConfig`
   * function as follows:
   * ```ts
   * @NgModule({
   *   imports: [BrowserAnimationsModule.withConfig(config)]
   * })
   * class MyNgModule {}
   * ```
   */
  static withConfig(config) {
    return {
      ngModule: _BrowserAnimationsModule,
      providers: config.disableAnimations ? BROWSER_NOOP_ANIMATIONS_PROVIDERS : BROWSER_ANIMATIONS_PROVIDERS
    };
  }
  static \u0275fac = function BrowserAnimationsModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _BrowserAnimationsModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _BrowserAnimationsModule,
    exports: [BrowserModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: BROWSER_ANIMATIONS_PROVIDERS,
    imports: [BrowserModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserAnimationsModule, [{
    type: NgModule,
    args: [{
      exports: [BrowserModule],
      providers: BROWSER_ANIMATIONS_PROVIDERS
    }]
  }], null, null);
})();
var NoopAnimationsModule = class _NoopAnimationsModule {
  static \u0275fac = function NoopAnimationsModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NoopAnimationsModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _NoopAnimationsModule,
    exports: [BrowserModule]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS,
    imports: [BrowserModule]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NoopAnimationsModule, [{
    type: NgModule,
    args: [{
      exports: [BrowserModule],
      providers: BROWSER_NOOP_ANIMATIONS_PROVIDERS
    }]
  }], null, null);
})();

// src/app/shared/services/auth.guard.ts
var AuthGuard = class _AuthGuard {
  constructor(router, auth) {
    this.router = router;
    this.auth = auth;
  }
  canActivate(route) {
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl("/sessions/signin");
      return false;
    }
    const requiredRoles = route.data["roles"];
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.some((role) => this.auth.hasRole(role));
      if (!hasRequiredRole) {
        this.router.navigate(["/dashboard"]);
        return false;
      }
    }
    return true;
  }
  static {
    this.\u0275fac = function AuthGuard_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AuthGuard)(\u0275\u0275inject(Router), \u0275\u0275inject(AuthService));
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthGuard, factory: _AuthGuard.\u0275fac, providedIn: "root" });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthGuard, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{ type: Router }, { type: AuthService }], null);
})();

// src/app/app-routing.module.ts
var adminRoutes = [
  {
    path: "pages",
    loadChildren: () => import("./pages.module-73LS2ILJ.js").then((m) => m.PagesModule)
  }
];
var routes = [
  {
    path: "",
    redirectTo: "sessions/connexion",
    pathMatch: "full"
  },
  {
    path: "inscription",
    redirectTo: "sessions/inscription"
  },
  {
    path: "",
    component: AuthLayoutComponent,
    children: [
      {
        path: "sessions",
        loadChildren: () => import("./sessions.module-5NDEILME.js").then((m) => m.SessionsModule)
      }
    ]
  },
  {
    path: "",
    component: AdminLayoutSidebarLargeComponent,
    canActivate: [AuthGuard],
    children: adminRoutes
  },
  {
    path: "**",
    redirectTo: "others/404"
  }
];
var AppRoutingModule = class _AppRoutingModule {
  static {
    this.\u0275fac = function AppRoutingModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AppRoutingModule)();
    };
  }
  static {
    this.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AppRoutingModule });
  }
  static {
    this.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [RouterModule.forRoot(routes, { useHash: true }), RouterModule] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppRoutingModule, [{
    type: NgModule,
    args: [{
      imports: [RouterModule.forRoot(routes, { useHash: true })],
      exports: [RouterModule]
    }]
  }], null, null);
})();

// src/app/shared/components/chatbot-assistant/chatbot-assistant.component.ts
function ChatbotAssistantComponent_span_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "span");
    \u0275\u0275text(1, "Aide");
    \u0275\u0275elementEnd();
  }
}
function ChatbotAssistantComponent_section_4_div_12_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 17);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const message_r3 = ctx.$implicit;
    \u0275\u0275classProp("user", message_r3.sender === "user");
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", message_r3.text, " ");
  }
}
function ChatbotAssistantComponent_section_4_button_14_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 18);
    \u0275\u0275listener("click", function ChatbotAssistantComponent_section_4_button_14_Template_button_click_0_listener() {
      const question_r5 = \u0275\u0275restoreView(_r4).$implicit;
      const ctx_r1 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r1.sendMessage(question_r5));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const question_r5 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", question_r5, " ");
  }
}
function ChatbotAssistantComponent_section_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "section", 5)(1, "header", 6)(2, "div")(3, "strong");
    \u0275\u0275text(4, "Assistant d'aide");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "span");
    \u0275\u0275text(6, "Reponses rapides");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(7, "button", 7);
    \u0275\u0275listener("click", function ChatbotAssistantComponent_section_4_Template_button_click_7_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.toggleChat());
    });
    \u0275\u0275element(8, "i", 8);
    \u0275\u0275elementStart(9, "span");
    \u0275\u0275text(10, "Fermer");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(11, "div", 9);
    \u0275\u0275template(12, ChatbotAssistantComponent_section_4_div_12_Template, 2, 3, "div", 10);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(13, "div", 11);
    \u0275\u0275template(14, ChatbotAssistantComponent_section_4_button_14_Template, 2, 1, "button", 12);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "form", 13);
    \u0275\u0275listener("ngSubmit", function ChatbotAssistantComponent_section_4_Template_form_ngSubmit_15_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.sendMessage());
    });
    \u0275\u0275elementStart(16, "input", 14);
    \u0275\u0275twoWayListener("ngModelChange", function ChatbotAssistantComponent_section_4_Template_input_ngModelChange_16_listener($event) {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      \u0275\u0275twoWayBindingSet(ctx_r1.userMessage, $event) || (ctx_r1.userMessage = $event);
      return \u0275\u0275resetView($event);
    });
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(17, "button", 15);
    \u0275\u0275element(18, "i", 16);
    \u0275\u0275elementStart(19, "span");
    \u0275\u0275text(20, "Envoyer");
    \u0275\u0275elementEnd()()()();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance(12);
    \u0275\u0275property("ngForOf", ctx_r1.messages);
    \u0275\u0275advance(2);
    \u0275\u0275property("ngForOf", ctx_r1.quickQuestions);
    \u0275\u0275advance(2);
    \u0275\u0275twoWayProperty("ngModel", ctx_r1.userMessage);
    \u0275\u0275advance();
    \u0275\u0275property("disabled", !ctx_r1.userMessage.trim());
  }
}
var ChatbotAssistantComponent = class _ChatbotAssistantComponent {
  constructor() {
    this.isOpen = false;
    this.userMessage = "";
    this.quickQuestions = [
      "Vente normale",
      "Vente a credit",
      "Produit et categorie",
      "Inventaire",
      "Facture et caisse",
      "Modifier ou annuler"
    ];
    this.messages = [
      {
        sender: "bot",
        text: "Bonjour. Je peux aider sur les ventes normales, ventes a credit, clients, produits, categories, inventaire, caisse, factures, remises et benefices."
      }
    ];
  }
  toggleChat() {
    this.isOpen = !this.isOpen;
  }
  sendMessage(message) {
    const text = (message || this.userMessage).trim();
    if (!text)
      return;
    this.messages.push({ sender: "user", text });
    this.messages.push({ sender: "bot", text: this.getAnswer(text) });
    this.userMessage = "";
  }
  getAnswer(question) {
    const text = this.normalize(question);
    if (text.includes("facture") && text.includes("caisse") || this.matches(text, ["encaissement facture"])) {
      return "Facture: apres la vente, utilisez le bouton Facture pour telecharger le PDF. Caisse: les ventes comptant sont encaissees directement, les ventes a credit sont suivies comme credit et entrent en caisse quand un reglement est enregistre.";
    }
    if (this.matches(text, ["modifier", "annuler", "annulation", "detail", "details", "afficher"])) {
      return "Dans Ventes, utilisez les boutons Details, Modifier ou Annuler sur la ligne de vente. Pour annuler, indiquez un motif puis confirmez. Une vente annulee remet les produits en stock. Un credit deja regle ne peut plus etre modifie ou annule.";
    }
    if (this.matches(text, ["credit", "creance", "echeance", "acompte", "reste", "reglement"])) {
      return "Pour une vente a credit, ouvrez Ventes puis Vente a Credit. Selectionnez ou creez le client, ajoutez les produits, indiquez la date d echeance et le montant verse si le client paie une partie. Le systeme affiche le total, le montant verse et le reste a payer.";
    }
    if (this.matches(text, ["benefice", "perte", "prix achat", "prix vente", "marge"])) {
      return "Le benefice est calcule avec le prix unitaire saisi moins le prix d achat, multiplie par la quantite. Si le prix saisi est inferieur au prix d achat, la ligne affiche une perte.";
    }
    if (this.matches(text, ["client", "amadou", "historique", "details", "suivi"])) {
      return "Dans Clients, cliquez sur Voir ventes. La fenetre affiche l historique complet et une section separee avec uniquement les ventes a credit, le total des credits, le montant verse et le reste a payer.";
    }
    if (this.matches(text, ["vente normale", "vente", "vendre", "panier", "comptant"])) {
      return "Pour une vente normale, ouvrez Ventes puis Nouvelle vente. Ajoutez les produits au panier, ajustez la quantite ou le prix unitaire, choisissez le mode de paiement, renseignez la reference si ce n est pas en especes, puis enregistrez.";
    }
    if (this.matches(text, ["produit", "article", "categorie", "fournisseur"])) {
      return "Pour ajouter un produit, ouvrez Produits, cliquez sur Ajouter, renseignez nom, categorie, prix achat, prix vente, stock et fournisseur si besoin. Les categories se gerent depuis la meme page Produits, dans la zone Categories.";
    }
    if (this.matches(text, ["inventaire", "stock", "quantite", "entree", "sortie", "ajustement"])) {
      return "Dans Inventaire, vous suivez les entrees, sorties et ajustements de stock. Les ventes retirent automatiquement les quantites vendues. Une annulation remet les produits en stock.";
    }
    if (this.matches(text, ["facture", "pdf", "export"])) {
      return "Apres une vente, cliquez sur Facture dans les actions pour telecharger ou imprimer le PDF. Les exports PDF de ventes sont disponibles dans le menu Export de la page Ventes.";
    }
    if (this.matches(text, ["caisse", "encaissement", "depense", "session", "revenu"])) {
      return "Dans Caisse, vous suivez les ventes encaisses, les reglements de credits, les sorties et les revenus. Les ventes comptant entrent directement en caisse, les credits entrent lors des reglements.";
    }
    if (this.matches(text, ["paiement", "orange", "moov", "virement", "carte", "reference"])) {
      return "Pour les paiements autres qu especes, renseignez la reference de paiement avant d enregistrer la vente.";
    }
    if (this.matches(text, ["remise", "reduction"])) {
      return "Vous pouvez ajouter une remise par ligne ou une remise globale. Le total, le benefice ou la perte se recalculent automatiquement apres remise.";
    }
    return "Je n ai pas trouve une reponse precise. Essayez avec des mots comme vente normale, credit, modifier, annuler, client, produit, categorie, inventaire, caisse, facture, stock, paiement, remise ou benefice.";
  }
  normalize(value) {
    return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  matches(text, keywords) {
    return keywords.some((keyword) => text.includes(keyword));
  }
  static {
    this.\u0275fac = function ChatbotAssistantComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ChatbotAssistantComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _ChatbotAssistantComponent, selectors: [["app-chatbot-assistant"]], decls: 5, vars: 6, consts: [[1, "chatbot-assistant"], ["type", "button", "aria-label", "Ouvrir le chat d'aide", "title", "Chat d'aide", 1, "chatbot-toggle", 3, "click"], [1, "fa", 3, "ngClass"], [4, "ngIf"], ["class", "chatbot-panel", 4, "ngIf"], [1, "chatbot-panel"], [1, "chatbot-header"], ["type", "button", "aria-label", "Fermer", 1, "chatbot-close", 3, "click"], [1, "fa", "fa-times"], [1, "chatbot-messages"], ["class", "chatbot-message", 3, "user", 4, "ngFor", "ngForOf"], [1, "chatbot-quick-actions"], ["type", "button", 3, "click", 4, "ngFor", "ngForOf"], [1, "chatbot-form", 3, "ngSubmit"], ["type", "text", "name", "chatbotMessage", "placeholder", "Ecrire votre question...", "autocomplete", "off", 3, "ngModelChange", "ngModel"], ["type", "submit", 3, "disabled"], [1, "fa", "fa-paper-plane"], [1, "chatbot-message"], ["type", "button", 3, "click"]], template: function ChatbotAssistantComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275elementStart(0, "div", 0)(1, "button", 1);
        \u0275\u0275listener("click", function ChatbotAssistantComponent_Template_button_click_1_listener() {
          return ctx.toggleChat();
        });
        \u0275\u0275element(2, "i", 2);
        \u0275\u0275template(3, ChatbotAssistantComponent_span_3_Template, 2, 0, "span", 3);
        \u0275\u0275elementEnd();
        \u0275\u0275template(4, ChatbotAssistantComponent_section_4_Template, 21, 4, "section", 4);
        \u0275\u0275elementEnd();
      }
      if (rf & 2) {
        \u0275\u0275classProp("is-open", ctx.isOpen);
        \u0275\u0275advance();
        \u0275\u0275attribute("aria-expanded", ctx.isOpen);
        \u0275\u0275advance();
        \u0275\u0275property("ngClass", ctx.isOpen ? "fa-times" : "fa-comments");
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", !ctx.isOpen);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.isOpen);
      }
    }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, DefaultValueAccessor, NgControlStatus, NgControlStatusGroup, NgModel, NgForm], styles: ["\n\n[_nghost-%COMP%] {\n  position: fixed;\n  right: 24px;\n  bottom: 24px;\n  z-index: 2147483000;\n  display: block;\n  pointer-events: none;\n}\n.chatbot-assistant[_ngcontent-%COMP%] {\n  position: fixed;\n  right: 24px;\n  bottom: 24px;\n  z-index: 2147483000;\n  font-family: inherit;\n  pointer-events: auto;\n}\n.chatbot-toggle[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  min-height: 58px;\n  min-width: 76px;\n  padding: 0 22px;\n  border: 0;\n  border-radius: 999px;\n  background: #263238;\n  color: #fff;\n  box-shadow: 0 12px 28px rgba(38, 50, 56, 0.22);\n  font-size: 16px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chatbot-toggle[_ngcontent-%COMP%]   i[_ngcontent-%COMP%] {\n  font-size: 21px;\n}\n.chatbot-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n  bottom: 74px;\n  width: min(460px, 100vw - 32px);\n  min-height: 520px;\n  max-height: min(680px, 100vh - 120px);\n  display: flex;\n  flex-direction: column;\n  background: #fff;\n  border: 1px solid #dde3ea;\n  border-radius: 8px;\n  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.2);\n  overflow: hidden;\n}\n.chatbot-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 16px 20px;\n  background: #f8fafc;\n  border-bottom: 1px solid #e5e7eb;\n}\n.chatbot-header[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%], \n.chatbot-header[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  display: block;\n}\n.chatbot-header[_ngcontent-%COMP%]   strong[_ngcontent-%COMP%] {\n  color: #1f2937;\n  font-size: 18px;\n}\n.chatbot-header[_ngcontent-%COMP%]   span[_ngcontent-%COMP%] {\n  color: #64748b;\n  font-size: 13px;\n  margin-top: 2px;\n}\n.chatbot-close[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  min-height: 42px;\n  padding: 0 16px;\n  border: 0;\n  border-radius: 6px;\n  background: #b91c1c;\n  color: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chatbot-messages[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 16px;\n  overflow-y: auto;\n  flex: 1;\n}\n.chatbot-message[_ngcontent-%COMP%] {\n  max-width: 88%;\n  padding: 12px 14px;\n  border-radius: 8px;\n  background: #eef4ff;\n  color: #1f2937;\n  font-size: 15px;\n  line-height: 1.45;\n}\n.chatbot-message.user[_ngcontent-%COMP%] {\n  align-self: flex-end;\n  background: #263238;\n  color: #fff;\n}\n.chatbot-quick-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 0 16px 16px;\n}\n.chatbot-quick-actions[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  border: 1px solid #d1d5db;\n  border-radius: 999px;\n  background: #fff;\n  color: #374151;\n  padding: 8px 12px;\n  font-size: 13px;\n  cursor: pointer;\n}\n.chatbot-form[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n  padding: 14px 16px;\n  border-top: 1px solid #e5e7eb;\n  background: #fff;\n}\n.chatbot-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n  flex: 1;\n  min-width: 0;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n  padding: 12px;\n  font-size: 15px;\n}\n.chatbot-form[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  min-width: 118px;\n  border: 0;\n  border-radius: 6px;\n  background: #0f766e;\n  color: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chatbot-form[_ngcontent-%COMP%]   button[_ngcontent-%COMP%]:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n@media (max-width: 576px) {\n  .chatbot-assistant[_ngcontent-%COMP%] {\n    right: 12px;\n    bottom: 12px;\n  }\n  .chatbot-toggle[_ngcontent-%COMP%] {\n    min-height: 54px;\n    padding: 0 18px;\n  }\n  .chatbot-panel[_ngcontent-%COMP%] {\n    bottom: 68px;\n    width: calc(100vw - 24px);\n    min-height: min(520px, 100vh - 96px);\n    max-height: calc(100vh - 96px);\n  }\n  .chatbot-header[_ngcontent-%COMP%] {\n    padding: 14px;\n  }\n  .chatbot-form[_ngcontent-%COMP%] {\n    flex-wrap: wrap;\n  }\n  .chatbot-form[_ngcontent-%COMP%]   input[_ngcontent-%COMP%] {\n    flex-basis: 100%;\n  }\n  .chatbot-form[_ngcontent-%COMP%]   button[_ngcontent-%COMP%] {\n    width: 100%;\n    min-height: 44px;\n  }\n}\n/*# sourceMappingURL=chatbot-assistant.component.css.map */"] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ChatbotAssistantComponent, [{
    type: Component,
    args: [{ selector: "app-chatbot-assistant", standalone: true, imports: [CommonModule, FormsModule], template: `<div class="chatbot-assistant" [class.is-open]="isOpen">
  <button type="button" class="chatbot-toggle" (click)="toggleChat()" [attr.aria-expanded]="isOpen" aria-label="Ouvrir le chat d'aide" title="Chat d'aide">
    <i class="fa" [ngClass]="isOpen ? 'fa-times' : 'fa-comments'"></i>
    <span *ngIf="!isOpen">Aide</span>
  </button>

  <section class="chatbot-panel" *ngIf="isOpen">
    <header class="chatbot-header">
      <div>
        <strong>Assistant d'aide</strong>
        <span>Reponses rapides</span>
      </div>
      <button type="button" class="chatbot-close" (click)="toggleChat()" aria-label="Fermer">
        <i class="fa fa-times"></i>
        <span>Fermer</span>
      </button>
    </header>

    <div class="chatbot-messages">
      <div *ngFor="let message of messages" class="chatbot-message" [class.user]="message.sender === 'user'">
        {{ message.text }}
      </div>
    </div>

    <div class="chatbot-quick-actions">
      <button type="button" *ngFor="let question of quickQuestions" (click)="sendMessage(question)">
        {{ question }}
      </button>
    </div>

    <form class="chatbot-form" (ngSubmit)="sendMessage()">
      <input
        type="text"
        name="chatbotMessage"
        [(ngModel)]="userMessage"
        placeholder="Ecrire votre question..."
        autocomplete="off"
      />
      <button type="submit" [disabled]="!userMessage.trim()">
        <i class="fa fa-paper-plane"></i>
        <span>Envoyer</span>
      </button>
    </form>
  </section>
</div>
`, styles: ["/* src/app/shared/components/chatbot-assistant/chatbot-assistant.component.scss */\n:host {\n  position: fixed;\n  right: 24px;\n  bottom: 24px;\n  z-index: 2147483000;\n  display: block;\n  pointer-events: none;\n}\n.chatbot-assistant {\n  position: fixed;\n  right: 24px;\n  bottom: 24px;\n  z-index: 2147483000;\n  font-family: inherit;\n  pointer-events: auto;\n}\n.chatbot-toggle {\n  display: inline-flex;\n  align-items: center;\n  gap: 10px;\n  min-height: 58px;\n  min-width: 76px;\n  padding: 0 22px;\n  border: 0;\n  border-radius: 999px;\n  background: #263238;\n  color: #fff;\n  box-shadow: 0 12px 28px rgba(38, 50, 56, 0.22);\n  font-size: 16px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chatbot-toggle i {\n  font-size: 21px;\n}\n.chatbot-panel {\n  position: absolute;\n  right: 0;\n  bottom: 74px;\n  width: min(460px, 100vw - 32px);\n  min-height: 520px;\n  max-height: min(680px, 100vh - 120px);\n  display: flex;\n  flex-direction: column;\n  background: #fff;\n  border: 1px solid #dde3ea;\n  border-radius: 8px;\n  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.2);\n  overflow: hidden;\n}\n.chatbot-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 16px 20px;\n  background: #f8fafc;\n  border-bottom: 1px solid #e5e7eb;\n}\n.chatbot-header strong,\n.chatbot-header span {\n  display: block;\n}\n.chatbot-header strong {\n  color: #1f2937;\n  font-size: 18px;\n}\n.chatbot-header span {\n  color: #64748b;\n  font-size: 13px;\n  margin-top: 2px;\n}\n.chatbot-close {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  min-height: 42px;\n  padding: 0 16px;\n  border: 0;\n  border-radius: 6px;\n  background: #b91c1c;\n  color: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chatbot-messages {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding: 16px;\n  overflow-y: auto;\n  flex: 1;\n}\n.chatbot-message {\n  max-width: 88%;\n  padding: 12px 14px;\n  border-radius: 8px;\n  background: #eef4ff;\n  color: #1f2937;\n  font-size: 15px;\n  line-height: 1.45;\n}\n.chatbot-message.user {\n  align-self: flex-end;\n  background: #263238;\n  color: #fff;\n}\n.chatbot-quick-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 8px;\n  padding: 0 16px 16px;\n}\n.chatbot-quick-actions button {\n  border: 1px solid #d1d5db;\n  border-radius: 999px;\n  background: #fff;\n  color: #374151;\n  padding: 8px 12px;\n  font-size: 13px;\n  cursor: pointer;\n}\n.chatbot-form {\n  display: flex;\n  gap: 8px;\n  padding: 14px 16px;\n  border-top: 1px solid #e5e7eb;\n  background: #fff;\n}\n.chatbot-form input {\n  flex: 1;\n  min-width: 0;\n  border: 1px solid #cbd5e1;\n  border-radius: 6px;\n  padding: 12px;\n  font-size: 15px;\n}\n.chatbot-form button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  min-width: 118px;\n  border: 0;\n  border-radius: 6px;\n  background: #0f766e;\n  color: #fff;\n  font-size: 14px;\n  font-weight: 700;\n  cursor: pointer;\n}\n.chatbot-form button:disabled {\n  opacity: 0.5;\n  cursor: not-allowed;\n}\n@media (max-width: 576px) {\n  .chatbot-assistant {\n    right: 12px;\n    bottom: 12px;\n  }\n  .chatbot-toggle {\n    min-height: 54px;\n    padding: 0 18px;\n  }\n  .chatbot-panel {\n    bottom: 68px;\n    width: calc(100vw - 24px);\n    min-height: min(520px, 100vh - 96px);\n    max-height: calc(100vh - 96px);\n  }\n  .chatbot-header {\n    padding: 14px;\n  }\n  .chatbot-form {\n    flex-wrap: wrap;\n  }\n  .chatbot-form input {\n    flex-basis: 100%;\n  }\n  .chatbot-form button {\n    width: 100%;\n    min-height: 44px;\n  }\n}\n/*# sourceMappingURL=chatbot-assistant.component.css.map */\n"] }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(ChatbotAssistantComponent, { className: "ChatbotAssistantComponent", filePath: "src/app/shared/components/chatbot-assistant/chatbot-assistant.component.ts", lineNumber: 17 });
})();

// src/app/app.component.ts
var AppComponent = class _AppComponent {
  constructor() {
    this.title = "bootDash";
  }
  static {
    this.\u0275fac = function AppComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AppComponent)();
    };
  }
  static {
    this.\u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _AppComponent, selectors: [["app-root"]], standalone: false, decls: 2, vars: 0, template: function AppComponent_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275element(0, "router-outlet")(1, "app-chatbot-assistant");
      }
    }, dependencies: [RouterOutlet, ChatbotAssistantComponent], encapsulation: 2 });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppComponent, [{
    type: Component,
    args: [{ selector: "app-root", standalone: false, template: "<router-outlet></router-outlet>\n<app-chatbot-assistant></app-chatbot-assistant>\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(AppComponent, { className: "AppComponent", filePath: "src/app/app.component.ts", lineNumber: 9 });
})();

// node_modules/ngx-toastr/fesm2022/ngx-toastr.mjs
var _c0 = ["toast-component", ""];
function Toast_button_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 5);
    \u0275\u0275listener("click", function Toast_button_0_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.remove());
    });
    \u0275\u0275elementStart(1, "span", 6);
    \u0275\u0275text(2, "\xD7");
    \u0275\u0275elementEnd()();
  }
}
function Toast_div_1_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275text(1);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("[", ctx_r1.duplicatesCount + 1, "]");
  }
}
function Toast_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275text(1);
    \u0275\u0275template(2, Toast_div_1_ng_container_2_Template, 2, 1, "ng-container", 4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.options.titleClass);
    \u0275\u0275attribute("aria-label", ctx_r1.title);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.title, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.duplicatesCount);
  }
}
function Toast_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 7);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.options.messageClass);
    \u0275\u0275property("innerHTML", ctx_r1.message, \u0275\u0275sanitizeHtml);
  }
}
function Toast_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.options.messageClass);
    \u0275\u0275attribute("aria-label", ctx_r1.message);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.message, " ");
  }
}
function Toast_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "div", 9);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275styleProp("width", ctx_r1.width() + "%");
  }
}
function ToastNoAnimation_button_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 5);
    \u0275\u0275listener("click", function ToastNoAnimation_button_0_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r1);
      const ctx_r1 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r1.remove());
    });
    \u0275\u0275elementStart(1, "span", 6);
    \u0275\u0275text(2, "\xD7");
    \u0275\u0275elementEnd()();
  }
}
function ToastNoAnimation_div_1_ng_container_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementContainerStart(0);
    \u0275\u0275text(1);
    \u0275\u0275elementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext(2);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1("[", ctx_r1.duplicatesCount + 1, "]");
  }
}
function ToastNoAnimation_div_1_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275text(1);
    \u0275\u0275template(2, ToastNoAnimation_div_1_ng_container_2_Template, 2, 1, "ng-container", 4);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.options.titleClass);
    \u0275\u0275attribute("aria-label", ctx_r1.title);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.title, " ");
    \u0275\u0275advance();
    \u0275\u0275property("ngIf", ctx_r1.duplicatesCount);
  }
}
function ToastNoAnimation_div_2_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275element(0, "div", 7);
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.options.messageClass);
    \u0275\u0275property("innerHTML", ctx_r1.message, \u0275\u0275sanitizeHtml);
  }
}
function ToastNoAnimation_div_3_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 8);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275classMap(ctx_r1.options.messageClass);
    \u0275\u0275attribute("aria-label", ctx_r1.message);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r1.message, " ");
  }
}
function ToastNoAnimation_div_4_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div");
    \u0275\u0275element(1, "div", 9);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = \u0275\u0275nextContext();
    \u0275\u0275advance();
    \u0275\u0275styleProp("width", ctx_r1.width() + "%");
  }
}
var ToastContainerDirective = class _ToastContainerDirective {
  el;
  constructor(el) {
    this.el = el;
  }
  getContainerElement() {
    return this.el.nativeElement;
  }
  static \u0275fac = function ToastContainerDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToastContainerDirective)(\u0275\u0275directiveInject(ElementRef));
  };
  static \u0275dir = /* @__PURE__ */ \u0275\u0275defineDirective({
    type: _ToastContainerDirective,
    selectors: [["", "toastContainer", ""]],
    exportAs: ["toastContainer"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastContainerDirective, [{
    type: Directive,
    args: [{
      selector: "[toastContainer]",
      exportAs: "toastContainer",
      standalone: true
    }]
  }], () => [{
    type: ElementRef
  }], null);
})();
var ComponentPortal = class {
  _attachedHost;
  /** The type of the component that will be instantiated for attachment. */
  component;
  /**
   * [Optional] Where the attached component should live in Angular's *logical* component tree.
   * This is different from where the component *renders*, which is determined by the PortalHost.
   * The origin necessary when the host is outside of the Angular application context.
   */
  viewContainerRef;
  /** Injector used for the instantiation of the component. */
  injector;
  constructor(component, injector) {
    this.component = component;
    this.injector = injector;
  }
  /** Attach this portal to a host. */
  attach(host, newestOnTop) {
    this._attachedHost = host;
    return host.attach(this, newestOnTop);
  }
  /** Detach this portal from its host */
  detach() {
    const host = this._attachedHost;
    if (host) {
      this._attachedHost = void 0;
      return host.detach();
    }
  }
  /** Whether this portal is attached to a host. */
  get isAttached() {
    return this._attachedHost != null;
  }
  /**
   * Sets the PortalHost reference without performing `attach()`. This is used directly by
   * the PortalHost when it is performing an `attach()` or `detach()`.
   */
  setAttachedHost(host) {
    this._attachedHost = host;
  }
};
var BasePortalHost = class {
  /** The portal currently attached to the host. */
  _attachedPortal;
  /** A function that will permanently dispose this host. */
  _disposeFn;
  attach(portal, newestOnTop) {
    this._attachedPortal = portal;
    return this.attachComponentPortal(portal, newestOnTop);
  }
  detach() {
    if (this._attachedPortal) {
      this._attachedPortal.setAttachedHost();
    }
    this._attachedPortal = void 0;
    if (this._disposeFn) {
      this._disposeFn();
      this._disposeFn = void 0;
    }
  }
  setDisposeFn(fn) {
    this._disposeFn = fn;
  }
};
var ToastRef = class {
  _overlayRef;
  /** The instance of component opened into the toast. */
  componentInstance;
  /** Count of duplicates of this toast */
  duplicatesCount = 0;
  /** Subject for notifying the user that the toast has finished closing. */
  _afterClosed = new Subject();
  /** triggered when toast is activated */
  _activate = new Subject();
  /** notifies the toast that it should close before the timeout */
  _manualClose = new Subject();
  /** notifies the toast that it should reset the timeouts */
  _resetTimeout = new Subject();
  /** notifies the toast that it should count a duplicate toast */
  _countDuplicate = new Subject();
  constructor(_overlayRef) {
    this._overlayRef = _overlayRef;
  }
  manualClose() {
    this._manualClose.next();
    this._manualClose.complete();
  }
  manualClosed() {
    return this._manualClose.asObservable();
  }
  timeoutReset() {
    return this._resetTimeout.asObservable();
  }
  countDuplicate() {
    return this._countDuplicate.asObservable();
  }
  /**
   * Close the toast.
   */
  close() {
    this._overlayRef.detach();
    this._afterClosed.next();
    this._manualClose.next();
    this._afterClosed.complete();
    this._manualClose.complete();
    this._activate.complete();
    this._resetTimeout.complete();
    this._countDuplicate.complete();
  }
  /** Gets an observable that is notified when the toast is finished closing. */
  afterClosed() {
    return this._afterClosed.asObservable();
  }
  isInactive() {
    return this._activate.isStopped;
  }
  activate() {
    this._activate.next();
    this._activate.complete();
  }
  /** Gets an observable that is notified when the toast has started opening. */
  afterActivate() {
    return this._activate.asObservable();
  }
  /** Reset the toast timouts and count duplicates */
  onDuplicate(resetTimeout, countDuplicate) {
    if (resetTimeout) {
      this._resetTimeout.next();
    }
    if (countDuplicate) {
      this._countDuplicate.next(++this.duplicatesCount);
    }
  }
};
var ToastPackage = class {
  toastId;
  config;
  message;
  title;
  toastType;
  toastRef;
  _onTap = new Subject();
  _onAction = new Subject();
  constructor(toastId, config, message, title, toastType, toastRef) {
    this.toastId = toastId;
    this.config = config;
    this.message = message;
    this.title = title;
    this.toastType = toastType;
    this.toastRef = toastRef;
    this.toastRef.afterClosed().subscribe(() => {
      this._onAction.complete();
      this._onTap.complete();
    });
  }
  /** Fired on click */
  triggerTap() {
    this._onTap.next();
    if (this.config.tapToDismiss) {
      this._onTap.complete();
    }
  }
  onTap() {
    return this._onTap.asObservable();
  }
  /** available for use in custom toast */
  triggerAction(action) {
    this._onAction.next(action);
  }
  onAction() {
    return this._onAction.asObservable();
  }
};
var DefaultNoComponentGlobalConfig = {
  maxOpened: 0,
  autoDismiss: false,
  newestOnTop: true,
  preventDuplicates: false,
  countDuplicates: false,
  resetTimeoutOnDuplicate: false,
  includeTitleDuplicates: false,
  iconClasses: {
    error: "toast-error",
    info: "toast-info",
    success: "toast-success",
    warning: "toast-warning"
  },
  // Individual
  closeButton: false,
  disableTimeOut: false,
  timeOut: 5e3,
  extendedTimeOut: 1e3,
  enableHtml: false,
  progressBar: false,
  toastClass: "ngx-toastr",
  positionClass: "toast-top-right",
  titleClass: "toast-title",
  messageClass: "toast-message",
  easing: "ease-in",
  easeTime: 300,
  tapToDismiss: true,
  onActivateTick: false,
  progressAnimation: "decreasing"
};
var TOAST_CONFIG = new InjectionToken("ToastConfig");
var DomPortalHost = class extends BasePortalHost {
  _hostDomElement;
  _componentFactoryResolver;
  _appRef;
  constructor(_hostDomElement, _componentFactoryResolver, _appRef) {
    super();
    this._hostDomElement = _hostDomElement;
    this._componentFactoryResolver = _componentFactoryResolver;
    this._appRef = _appRef;
  }
  /**
   * Attach the given ComponentPortal to DOM element using the ComponentFactoryResolver.
   * @param portal Portal to be attached
   */
  attachComponentPortal(portal, newestOnTop) {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(portal.component);
    let componentRef;
    componentRef = componentFactory.create(portal.injector);
    this._appRef.attachView(componentRef.hostView);
    this.setDisposeFn(() => {
      this._appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });
    if (newestOnTop) {
      this._hostDomElement.insertBefore(this._getComponentRootNode(componentRef), this._hostDomElement.firstChild);
    } else {
      this._hostDomElement.appendChild(this._getComponentRootNode(componentRef));
    }
    return componentRef;
  }
  /** Gets the root HTMLElement for an instantiated component. */
  _getComponentRootNode(componentRef) {
    return componentRef.hostView.rootNodes[0];
  }
};
var OverlayContainer = class _OverlayContainer {
  _document = inject(DOCUMENT);
  _containerElement;
  ngOnDestroy() {
    if (this._containerElement && this._containerElement.parentNode) {
      this._containerElement.parentNode.removeChild(this._containerElement);
    }
  }
  /**
   * This method returns the overlay container element. It will lazily
   * create the element the first time  it is called to facilitate using
   * the container in non-browser environments.
   * @returns the container element
   */
  getContainerElement() {
    if (!this._containerElement) {
      this._createContainer();
    }
    return this._containerElement;
  }
  /**
   * Create the overlay container element, which is simply a div
   * with the 'cdk-overlay-container' class on the document body
   * and 'aria-live="polite"'
   */
  _createContainer() {
    const container = this._document.createElement("div");
    container.classList.add("overlay-container");
    container.setAttribute("aria-live", "polite");
    this._document.body.appendChild(container);
    this._containerElement = container;
  }
  static \u0275fac = function OverlayContainer_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _OverlayContainer)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _OverlayContainer,
    factory: _OverlayContainer.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(OverlayContainer, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var OverlayRef = class {
  _portalHost;
  constructor(_portalHost) {
    this._portalHost = _portalHost;
  }
  attach(portal, newestOnTop = true) {
    return this._portalHost.attach(portal, newestOnTop);
  }
  /**
   * Detaches an overlay from a portal.
   * @returns Resolves when the overlay has been detached.
   */
  detach() {
    return this._portalHost.detach();
  }
};
var Overlay = class _Overlay {
  _overlayContainer = inject(OverlayContainer);
  _componentFactoryResolver = inject(ComponentFactoryResolver$1);
  _appRef = inject(ApplicationRef);
  _document = inject(DOCUMENT);
  // Namespace panes by overlay container
  _paneElements = /* @__PURE__ */ new Map();
  /**
   * Creates an overlay.
   * @returns A reference to the created overlay.
   */
  create(positionClass, overlayContainer) {
    return this._createOverlayRef(this.getPaneElement(positionClass, overlayContainer));
  }
  getPaneElement(positionClass = "", overlayContainer) {
    if (!this._paneElements.get(overlayContainer)) {
      this._paneElements.set(overlayContainer, {});
    }
    if (!this._paneElements.get(overlayContainer)[positionClass]) {
      this._paneElements.get(overlayContainer)[positionClass] = this._createPaneElement(positionClass, overlayContainer);
    }
    return this._paneElements.get(overlayContainer)[positionClass];
  }
  /**
   * Creates the DOM element for an overlay and appends it to the overlay container.
   * @returns Newly-created pane element
   */
  _createPaneElement(positionClass, overlayContainer) {
    const pane = this._document.createElement("div");
    pane.id = "toast-container";
    pane.classList.add(positionClass);
    pane.classList.add("toast-container");
    if (!overlayContainer) {
      this._overlayContainer.getContainerElement().appendChild(pane);
    } else {
      overlayContainer.getContainerElement().appendChild(pane);
    }
    return pane;
  }
  /**
   * Create a DomPortalHost into which the overlay content can be loaded.
   * @param pane The DOM element to turn into a portal host.
   * @returns A portal host for the given DOM element.
   */
  _createPortalHost(pane) {
    return new DomPortalHost(pane, this._componentFactoryResolver, this._appRef);
  }
  /**
   * Creates an OverlayRef for an overlay in the given DOM element.
   * @param pane DOM element for the overlay
   */
  _createOverlayRef(pane) {
    return new OverlayRef(this._createPortalHost(pane));
  }
  static \u0275fac = function Overlay_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Overlay)();
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _Overlay,
    factory: _Overlay.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Overlay, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var ToastrService = class _ToastrService {
  overlay;
  _injector;
  sanitizer;
  ngZone;
  toastrConfig;
  currentlyActive = 0;
  toasts = [];
  overlayContainer;
  previousToastMessage;
  index = 0;
  constructor(token, overlay, _injector, sanitizer, ngZone) {
    this.overlay = overlay;
    this._injector = _injector;
    this.sanitizer = sanitizer;
    this.ngZone = ngZone;
    this.toastrConfig = __spreadValues(__spreadValues({}, token.default), token.config);
    if (token.config.iconClasses) {
      this.toastrConfig.iconClasses = __spreadValues(__spreadValues({}, token.default.iconClasses), token.config.iconClasses);
    }
  }
  /** show toast */
  show(message, title, override = {}, type = "") {
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show successful toast */
  success(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.success || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show error toast */
  error(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.error || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show info toast */
  info(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.info || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /** show warning toast */
  warning(message, title, override = {}) {
    const type = this.toastrConfig.iconClasses.warning || "";
    return this._preBuildNotification(type, message, title, this.applyConfig(override));
  }
  /**
   * Remove all or a single toast by id
   */
  clear(toastId) {
    for (const toast of this.toasts) {
      if (toastId !== void 0) {
        if (toast.toastId === toastId) {
          toast.toastRef.manualClose();
          return;
        }
      } else {
        toast.toastRef.manualClose();
      }
    }
  }
  /**
   * Remove and destroy a single toast by id
   */
  remove(toastId) {
    const found = this._findToast(toastId);
    if (!found) {
      return false;
    }
    found.activeToast.toastRef.close();
    this.toasts.splice(found.index, 1);
    this.currentlyActive = this.currentlyActive - 1;
    if (!this.toastrConfig.maxOpened || !this.toasts.length) {
      return false;
    }
    if (this.currentlyActive < this.toastrConfig.maxOpened && this.toasts[this.currentlyActive]) {
      const p = this.toasts[this.currentlyActive].toastRef;
      if (!p.isInactive()) {
        this.currentlyActive = this.currentlyActive + 1;
        p.activate();
      }
    }
    return true;
  }
  /**
   * Determines if toast message is already shown
   */
  findDuplicate(title = "", message = "", resetOnDuplicate, countDuplicates) {
    const {
      includeTitleDuplicates
    } = this.toastrConfig;
    for (const toast of this.toasts) {
      const hasDuplicateTitle = includeTitleDuplicates && toast.title === title;
      if ((!includeTitleDuplicates || hasDuplicateTitle) && toast.message === message) {
        toast.toastRef.onDuplicate(resetOnDuplicate, countDuplicates);
        return toast;
      }
    }
    return null;
  }
  /** create a clone of global config and apply individual settings */
  applyConfig(override = {}) {
    return __spreadValues(__spreadValues({}, this.toastrConfig), override);
  }
  /**
   * Find toast object by id
   */
  _findToast(toastId) {
    for (let i = 0; i < this.toasts.length; i++) {
      if (this.toasts[i].toastId === toastId) {
        return {
          index: i,
          activeToast: this.toasts[i]
        };
      }
    }
    return null;
  }
  /**
   * Determines the need to run inside angular's zone then builds the toast
   */
  _preBuildNotification(toastType, message, title, config) {
    if (config.onActivateTick) {
      return this.ngZone.run(() => this._buildNotification(toastType, message, title, config));
    }
    return this._buildNotification(toastType, message, title, config);
  }
  /**
   * Creates and attaches toast data to component
   * returns the active toast, or in case preventDuplicates is enabled the original/non-duplicate active toast.
   */
  _buildNotification(toastType, message, title, config) {
    if (!config.toastComponent) {
      throw new Error("toastComponent required");
    }
    const duplicate = this.findDuplicate(title, message, this.toastrConfig.resetTimeoutOnDuplicate && config.timeOut > 0, this.toastrConfig.countDuplicates);
    if ((this.toastrConfig.includeTitleDuplicates && title || message) && this.toastrConfig.preventDuplicates && duplicate !== null) {
      return duplicate;
    }
    this.previousToastMessage = message;
    let keepInactive = false;
    if (this.toastrConfig.maxOpened && this.currentlyActive >= this.toastrConfig.maxOpened) {
      keepInactive = true;
      if (this.toastrConfig.autoDismiss) {
        this.clear(this.toasts[0].toastId);
      }
    }
    const overlayRef = this.overlay.create(config.positionClass, this.overlayContainer);
    this.index = this.index + 1;
    let sanitizedMessage = message;
    if (message && config.enableHtml) {
      sanitizedMessage = this.sanitizer.sanitize(SecurityContext.HTML, message);
    }
    const toastRef = new ToastRef(overlayRef);
    const toastPackage = new ToastPackage(this.index, config, sanitizedMessage, title, toastType, toastRef);
    const providers = [{
      provide: ToastPackage,
      useValue: toastPackage
    }];
    const toastInjector = Injector.create({
      providers,
      parent: this._injector
    });
    const component = new ComponentPortal(config.toastComponent, toastInjector);
    const portal = overlayRef.attach(component, config.newestOnTop);
    toastRef.componentInstance = portal.instance;
    const ins = {
      toastId: this.index,
      title: title || "",
      message: message || "",
      toastRef,
      onShown: toastRef.afterActivate(),
      onHidden: toastRef.afterClosed(),
      onTap: toastPackage.onTap(),
      onAction: toastPackage.onAction(),
      portal
    };
    if (!keepInactive) {
      this.currentlyActive = this.currentlyActive + 1;
      setTimeout(() => {
        ins.toastRef.activate();
      });
    }
    this.toasts.push(ins);
    return ins;
  }
  static \u0275fac = function ToastrService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToastrService)(\u0275\u0275inject(TOAST_CONFIG), \u0275\u0275inject(Overlay), \u0275\u0275inject(Injector), \u0275\u0275inject(DomSanitizer), \u0275\u0275inject(NgZone));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _ToastrService,
    factory: _ToastrService.\u0275fac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastrService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Inject,
      args: [TOAST_CONFIG]
    }]
  }, {
    type: Overlay
  }, {
    type: Injector
  }, {
    type: DomSanitizer
  }, {
    type: NgZone
  }], null);
})();
var Toast = class _Toast {
  toastrService;
  toastPackage;
  ngZone;
  message;
  title;
  options;
  duplicatesCount;
  originalTimeout;
  /** width of progress bar */
  width = signal(-1);
  /** a combination of toast type and options.toastClass */
  toastClasses = "";
  state;
  /** controls animation */
  get _state() {
    return this.state();
  }
  /** hides component when waiting to be displayed */
  get displayStyle() {
    if (this.state().value === "inactive") {
      return "none";
    }
    return;
  }
  timeout;
  intervalId;
  hideTime;
  sub;
  sub1;
  sub2;
  sub3;
  constructor(toastrService, toastPackage, ngZone) {
    this.toastrService = toastrService;
    this.toastPackage = toastPackage;
    this.ngZone = ngZone;
    this.message = toastPackage.message;
    this.title = toastPackage.title;
    this.options = toastPackage.config;
    this.originalTimeout = toastPackage.config.timeOut;
    this.toastClasses = `${toastPackage.toastType} ${toastPackage.config.toastClass}`;
    this.sub = toastPackage.toastRef.afterActivate().subscribe(() => {
      this.activateToast();
    });
    this.sub1 = toastPackage.toastRef.manualClosed().subscribe(() => {
      this.remove();
    });
    this.sub2 = toastPackage.toastRef.timeoutReset().subscribe(() => {
      this.resetTimeout();
    });
    this.sub3 = toastPackage.toastRef.countDuplicate().subscribe((count) => {
      this.duplicatesCount = count;
    });
    this.state = signal({
      value: "inactive",
      params: {
        easeTime: this.toastPackage.config.easeTime,
        easing: "ease-in"
      }
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    clearInterval(this.intervalId);
    clearTimeout(this.timeout);
  }
  /**
   * activates toast and sets timeout
   */
  activateToast() {
    this.state.update((state2) => __spreadProps(__spreadValues({}, state2), {
      value: "active"
    }));
    if (!(this.options.disableTimeOut === true || this.options.disableTimeOut === "timeOut") && this.options.timeOut) {
      this.outsideTimeout(() => this.remove(), this.options.timeOut);
      this.hideTime = (/* @__PURE__ */ new Date()).getTime() + this.options.timeOut;
      if (this.options.progressBar) {
        this.outsideInterval(() => this.updateProgress(), 10);
      }
    }
  }
  /**
   * updates progress bar width
   */
  updateProgress() {
    if (this.width() === 0 || this.width() === 100 || !this.options.timeOut) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).getTime();
    const remaining = this.hideTime - now;
    this.width.set(remaining / this.options.timeOut * 100);
    if (this.options.progressAnimation === "increasing") {
      this.width.update((width) => 100 - width);
    }
    if (this.width() <= 0) {
      this.width.set(0);
    }
    if (this.width() >= 100) {
      this.width.set(100);
    }
  }
  resetTimeout() {
    clearTimeout(this.timeout);
    clearInterval(this.intervalId);
    this.state.update((state2) => __spreadProps(__spreadValues({}, state2), {
      value: "active"
    }));
    this.outsideTimeout(() => this.remove(), this.originalTimeout);
    this.options.timeOut = this.originalTimeout;
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.options.timeOut || 0);
    this.width.set(-1);
    if (this.options.progressBar) {
      this.outsideInterval(() => this.updateProgress(), 10);
    }
  }
  /**
   * tells toastrService to remove this toast after animation time
   */
  remove() {
    if (this.state().value === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.state.update((state2) => __spreadProps(__spreadValues({}, state2), {
      value: "removed"
    }));
    this.outsideTimeout(() => this.toastrService.remove(this.toastPackage.toastId), +this.toastPackage.config.easeTime);
  }
  tapToast() {
    if (this.state().value === "removed") {
      return;
    }
    this.toastPackage.triggerTap();
    if (this.options.tapToDismiss) {
      this.remove();
    }
  }
  stickAround() {
    if (this.state().value === "removed") {
      return;
    }
    if (this.options.disableTimeOut !== "extendedTimeOut") {
      clearTimeout(this.timeout);
      this.options.timeOut = 0;
      this.hideTime = 0;
      clearInterval(this.intervalId);
      this.width.set(0);
    }
  }
  delayedHideToast() {
    if (this.options.disableTimeOut === true || this.options.disableTimeOut === "extendedTimeOut" || this.options.extendedTimeOut === 0 || this.state().value === "removed") {
      return;
    }
    this.outsideTimeout(() => this.remove(), this.options.extendedTimeOut);
    this.options.timeOut = this.options.extendedTimeOut;
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.options.timeOut || 0);
    this.width.set(-1);
    if (this.options.progressBar) {
      this.outsideInterval(() => this.updateProgress(), 10);
    }
  }
  outsideTimeout(func, timeout) {
    if (this.ngZone) {
      this.ngZone.runOutsideAngular(() => this.timeout = setTimeout(() => this.runInsideAngular(func), timeout));
    } else {
      this.timeout = setTimeout(() => func(), timeout);
    }
  }
  outsideInterval(func, timeout) {
    if (this.ngZone) {
      this.ngZone.runOutsideAngular(() => this.intervalId = setInterval(() => this.runInsideAngular(func), timeout));
    } else {
      this.intervalId = setInterval(() => func(), timeout);
    }
  }
  runInsideAngular(func) {
    if (this.ngZone) {
      this.ngZone.run(() => func());
    } else {
      func();
    }
  }
  static \u0275fac = function Toast_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Toast)(\u0275\u0275directiveInject(ToastrService), \u0275\u0275directiveInject(ToastPackage), \u0275\u0275directiveInject(NgZone));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _Toast,
    selectors: [["", "toast-component", ""]],
    hostVars: 5,
    hostBindings: function Toast_HostBindings(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275listener("click", function Toast_click_HostBindingHandler() {
          return ctx.tapToast();
        })("mouseenter", function Toast_mouseenter_HostBindingHandler() {
          return ctx.stickAround();
        })("mouseleave", function Toast_mouseleave_HostBindingHandler() {
          return ctx.delayedHideToast();
        });
      }
      if (rf & 2) {
        \u0275\u0275syntheticHostProperty("@flyInOut", ctx._state);
        \u0275\u0275classMap(ctx.toastClasses);
        \u0275\u0275styleProp("display", ctx.displayStyle);
      }
    },
    attrs: _c0,
    decls: 5,
    vars: 5,
    consts: [["type", "button", "class", "toast-close-button", "aria-label", "Close", 3, "click", 4, "ngIf"], [3, "class", 4, "ngIf"], ["role", "alert", 3, "class", "innerHTML", 4, "ngIf"], ["role", "alert", 3, "class", 4, "ngIf"], [4, "ngIf"], ["type", "button", "aria-label", "Close", 1, "toast-close-button", 3, "click"], ["aria-hidden", "true"], ["role", "alert", 3, "innerHTML"], ["role", "alert"], [1, "toast-progress"]],
    template: function Toast_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275template(0, Toast_button_0_Template, 3, 0, "button", 0)(1, Toast_div_1_Template, 3, 5, "div", 1)(2, Toast_div_2_Template, 1, 3, "div", 2)(3, Toast_div_3_Template, 2, 4, "div", 3)(4, Toast_div_4_Template, 2, 2, "div", 4);
      }
      if (rf & 2) {
        \u0275\u0275property("ngIf", ctx.options.closeButton);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.title);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.message && ctx.options.enableHtml);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.message && !ctx.options.enableHtml);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.options.progressBar);
      }
    },
    dependencies: [NgIf],
    encapsulation: 2,
    data: {
      animation: [trigger("flyInOut", [state("inactive", style({
        opacity: 0
      })), state("active", style({
        opacity: 1
      })), state("removed", style({
        opacity: 0
      })), transition("inactive => active", animate("{{ easeTime }}ms {{ easing }}")), transition("active => removed", animate("{{ easeTime }}ms {{ easing }}"))])]
    },
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Toast, [{
    type: Component,
    args: [{
      selector: "[toast-component]",
      template: `
  <button *ngIf="options.closeButton" (click)="remove()" type="button" class="toast-close-button" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
    {{ title }} <ng-container *ngIf="duplicatesCount">[{{ duplicatesCount + 1 }}]</ng-container>
  </div>
  <div *ngIf="message && options.enableHtml" role="alert"
    [class]="options.messageClass" [innerHTML]="message">
  </div>
  <div *ngIf="message && !options.enableHtml" role="alert"
    [class]="options.messageClass" [attr.aria-label]="message">
    {{ message }}
  </div>
  <div *ngIf="options.progressBar">
    <div class="toast-progress" [style.width]="width() + '%'"></div>
  </div>
  `,
      animations: [trigger("flyInOut", [state("inactive", style({
        opacity: 0
      })), state("active", style({
        opacity: 1
      })), state("removed", style({
        opacity: 0
      })), transition("inactive => active", animate("{{ easeTime }}ms {{ easing }}")), transition("active => removed", animate("{{ easeTime }}ms {{ easing }}"))])],
      preserveWhitespaces: false,
      standalone: true,
      imports: [NgIf],
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], () => [{
    type: ToastrService
  }, {
    type: ToastPackage
  }, {
    type: NgZone
  }], {
    toastClasses: [{
      type: HostBinding,
      args: ["class"]
    }],
    _state: [{
      type: HostBinding,
      args: ["@flyInOut"]
    }],
    displayStyle: [{
      type: HostBinding,
      args: ["style.display"]
    }],
    tapToast: [{
      type: HostListener,
      args: ["click"]
    }],
    stickAround: [{
      type: HostListener,
      args: ["mouseenter"]
    }],
    delayedHideToast: [{
      type: HostListener,
      args: ["mouseleave"]
    }]
  });
})();
var DefaultGlobalConfig = __spreadProps(__spreadValues({}, DefaultNoComponentGlobalConfig), {
  toastComponent: Toast
});
var provideToastr = (config = {}) => {
  const providers = [{
    provide: TOAST_CONFIG,
    useValue: {
      default: DefaultGlobalConfig,
      config
    }
  }];
  return makeEnvironmentProviders(providers);
};
var ToastrModule = class _ToastrModule {
  static forRoot(config = {}) {
    return {
      ngModule: _ToastrModule,
      providers: [provideToastr(config)]
    };
  }
  static \u0275fac = function ToastrModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToastrModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ToastrModule,
    imports: [Toast],
    exports: [Toast]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastrModule, [{
    type: NgModule,
    args: [{
      imports: [Toast],
      exports: [Toast]
    }]
  }], null, null);
})();
var ToastrComponentlessModule = class _ToastrComponentlessModule {
  static forRoot(config = {}) {
    return {
      ngModule: ToastrModule,
      providers: [{
        provide: TOAST_CONFIG,
        useValue: {
          default: DefaultNoComponentGlobalConfig,
          config
        }
      }]
    };
  }
  static \u0275fac = function ToastrComponentlessModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToastrComponentlessModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ToastrComponentlessModule
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastrComponentlessModule, [{
    type: NgModule,
    args: [{}]
  }], null, null);
})();
var ToastNoAnimation = class _ToastNoAnimation {
  toastrService;
  toastPackage;
  appRef;
  message;
  title;
  options;
  duplicatesCount;
  originalTimeout;
  /** width of progress bar */
  width = signal(-1);
  /** a combination of toast type and options.toastClass */
  toastClasses = "";
  /** hides component when waiting to be displayed */
  get displayStyle() {
    if (this.state() === "inactive") {
      return "none";
    }
    return null;
  }
  /** controls animation */
  state = signal("inactive");
  timeout;
  intervalId;
  hideTime;
  sub;
  sub1;
  sub2;
  sub3;
  constructor(toastrService, toastPackage, appRef) {
    this.toastrService = toastrService;
    this.toastPackage = toastPackage;
    this.appRef = appRef;
    this.message = toastPackage.message;
    this.title = toastPackage.title;
    this.options = toastPackage.config;
    this.originalTimeout = toastPackage.config.timeOut;
    this.toastClasses = `${toastPackage.toastType} ${toastPackage.config.toastClass}`;
    this.sub = toastPackage.toastRef.afterActivate().subscribe(() => {
      this.activateToast();
    });
    this.sub1 = toastPackage.toastRef.manualClosed().subscribe(() => {
      this.remove();
    });
    this.sub2 = toastPackage.toastRef.timeoutReset().subscribe(() => {
      this.resetTimeout();
    });
    this.sub3 = toastPackage.toastRef.countDuplicate().subscribe((count) => {
      this.duplicatesCount = count;
    });
  }
  ngOnDestroy() {
    this.sub.unsubscribe();
    this.sub1.unsubscribe();
    this.sub2.unsubscribe();
    this.sub3.unsubscribe();
    clearInterval(this.intervalId);
    clearTimeout(this.timeout);
  }
  /**
   * activates toast and sets timeout
   */
  activateToast() {
    this.state.set("active");
    if (!(this.options.disableTimeOut === true || this.options.disableTimeOut === "timeOut") && this.options.timeOut) {
      this.timeout = setTimeout(() => {
        this.remove();
      }, this.options.timeOut);
      this.hideTime = (/* @__PURE__ */ new Date()).getTime() + this.options.timeOut;
      if (this.options.progressBar) {
        this.intervalId = setInterval(() => this.updateProgress(), 10);
      }
    }
    if (this.options.onActivateTick) {
      this.appRef.tick();
    }
  }
  /**
   * updates progress bar width
   */
  updateProgress() {
    if (this.width() === 0 || this.width() === 100 || !this.options.timeOut) {
      return;
    }
    const now = (/* @__PURE__ */ new Date()).getTime();
    const remaining = this.hideTime - now;
    this.width.set(remaining / this.options.timeOut * 100);
    if (this.options.progressAnimation === "increasing") {
      this.width.update((width) => 100 - width);
    }
    if (this.width() <= 0) {
      this.width.set(0);
    }
    if (this.width() >= 100) {
      this.width.set(100);
    }
  }
  resetTimeout() {
    clearTimeout(this.timeout);
    clearInterval(this.intervalId);
    this.state.set("active");
    this.options.timeOut = this.originalTimeout;
    this.timeout = setTimeout(() => this.remove(), this.originalTimeout);
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.originalTimeout || 0);
    this.width.set(-1);
    if (this.options.progressBar) {
      this.intervalId = setInterval(() => this.updateProgress(), 10);
    }
  }
  /**
   * tells toastrService to remove this toast after animation time
   */
  remove() {
    if (this.state() === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.state.set("removed");
    this.timeout = setTimeout(() => this.toastrService.remove(this.toastPackage.toastId));
  }
  tapToast() {
    if (this.state() === "removed") {
      return;
    }
    this.toastPackage.triggerTap();
    if (this.options.tapToDismiss) {
      this.remove();
    }
  }
  stickAround() {
    if (this.state() === "removed") {
      return;
    }
    clearTimeout(this.timeout);
    this.options.timeOut = 0;
    this.hideTime = 0;
    clearInterval(this.intervalId);
    this.width.set(0);
  }
  delayedHideToast() {
    if (this.options.disableTimeOut === true || this.options.disableTimeOut === "extendedTimeOut" || this.options.extendedTimeOut === 0 || this.state() === "removed") {
      return;
    }
    this.timeout = setTimeout(() => this.remove(), this.options.extendedTimeOut);
    this.options.timeOut = this.options.extendedTimeOut;
    this.hideTime = (/* @__PURE__ */ new Date()).getTime() + (this.options.timeOut || 0);
    this.width.set(-1);
    if (this.options.progressBar) {
      this.intervalId = setInterval(() => this.updateProgress(), 10);
    }
  }
  static \u0275fac = function ToastNoAnimation_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToastNoAnimation)(\u0275\u0275directiveInject(ToastrService), \u0275\u0275directiveInject(ToastPackage), \u0275\u0275directiveInject(ApplicationRef));
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({
    type: _ToastNoAnimation,
    selectors: [["", "toast-component", ""]],
    hostVars: 4,
    hostBindings: function ToastNoAnimation_HostBindings(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275listener("click", function ToastNoAnimation_click_HostBindingHandler() {
          return ctx.tapToast();
        })("mouseenter", function ToastNoAnimation_mouseenter_HostBindingHandler() {
          return ctx.stickAround();
        })("mouseleave", function ToastNoAnimation_mouseleave_HostBindingHandler() {
          return ctx.delayedHideToast();
        });
      }
      if (rf & 2) {
        \u0275\u0275classMap(ctx.toastClasses);
        \u0275\u0275styleProp("display", ctx.displayStyle);
      }
    },
    attrs: _c0,
    decls: 5,
    vars: 5,
    consts: [["type", "button", "class", "toast-close-button", "aria-label", "Close", 3, "click", 4, "ngIf"], [3, "class", 4, "ngIf"], ["role", "alert", 3, "class", "innerHTML", 4, "ngIf"], ["role", "alert", 3, "class", 4, "ngIf"], [4, "ngIf"], ["type", "button", "aria-label", "Close", 1, "toast-close-button", 3, "click"], ["aria-hidden", "true"], ["role", "alert", 3, "innerHTML"], ["role", "alert"], [1, "toast-progress"]],
    template: function ToastNoAnimation_Template(rf, ctx) {
      if (rf & 1) {
        \u0275\u0275template(0, ToastNoAnimation_button_0_Template, 3, 0, "button", 0)(1, ToastNoAnimation_div_1_Template, 3, 5, "div", 1)(2, ToastNoAnimation_div_2_Template, 1, 3, "div", 2)(3, ToastNoAnimation_div_3_Template, 2, 4, "div", 3)(4, ToastNoAnimation_div_4_Template, 2, 2, "div", 4);
      }
      if (rf & 2) {
        \u0275\u0275property("ngIf", ctx.options.closeButton);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.title);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.message && ctx.options.enableHtml);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.message && !ctx.options.enableHtml);
        \u0275\u0275advance();
        \u0275\u0275property("ngIf", ctx.options.progressBar);
      }
    },
    dependencies: [NgIf],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastNoAnimation, [{
    type: Component,
    args: [{
      selector: "[toast-component]",
      template: `
  <button *ngIf="options.closeButton" (click)="remove()" type="button" class="toast-close-button" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
  <div *ngIf="title" [class]="options.titleClass" [attr.aria-label]="title">
    {{ title }} <ng-container *ngIf="duplicatesCount">[{{ duplicatesCount + 1 }}]</ng-container>
  </div>
  <div *ngIf="message && options.enableHtml" role="alert"
    [class]="options.messageClass" [innerHTML]="message">
  </div>
  <div *ngIf="message && !options.enableHtml" role="alert"
    [class]="options.messageClass" [attr.aria-label]="message">
    {{ message }}
  </div>
  <div *ngIf="options.progressBar">
    <div class="toast-progress" [style.width]="width() + '%'"></div>
  </div>
  `,
      standalone: true,
      imports: [NgIf],
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], () => [{
    type: ToastrService
  }, {
    type: ToastPackage
  }, {
    type: ApplicationRef
  }], {
    toastClasses: [{
      type: HostBinding,
      args: ["class"]
    }],
    displayStyle: [{
      type: HostBinding,
      args: ["style.display"]
    }],
    tapToast: [{
      type: HostListener,
      args: ["click"]
    }],
    stickAround: [{
      type: HostListener,
      args: ["mouseenter"]
    }],
    delayedHideToast: [{
      type: HostListener,
      args: ["mouseleave"]
    }]
  });
})();
var DefaultNoAnimationsGlobalConfig = __spreadProps(__spreadValues({}, DefaultNoComponentGlobalConfig), {
  toastComponent: ToastNoAnimation
});
var ToastNoAnimationModule = class _ToastNoAnimationModule {
  static forRoot(config = {}) {
    return {
      ngModule: _ToastNoAnimationModule,
      providers: [{
        provide: TOAST_CONFIG,
        useValue: {
          default: DefaultNoAnimationsGlobalConfig,
          config
        }
      }]
    };
  }
  static \u0275fac = function ToastNoAnimationModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ToastNoAnimationModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ToastNoAnimationModule,
    imports: [ToastNoAnimation],
    exports: [ToastNoAnimation]
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ToastNoAnimationModule, [{
    type: NgModule,
    args: [{
      imports: [ToastNoAnimation],
      exports: [ToastNoAnimation]
    }]
  }], null, null);
})();

// src/app/shared/shared.module.ts
var SharedModule = class _SharedModule {
  static {
    this.\u0275fac = function SharedModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _SharedModule)();
    };
  }
  static {
    this.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _SharedModule });
  }
  static {
    this.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ imports: [
      CommonModule,
      SearchModule,
      ToastrModule.forRoot(),
      NgbModule,
      SharedComponentsModule,
      SharedDirectivesModule,
      SharedPipesModule,
      RouterModule
    ] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SharedModule, [{
    type: NgModule,
    args: [{
      imports: [
        CommonModule,
        SearchModule,
        ToastrModule.forRoot(),
        NgbModule,
        SharedComponentsModule,
        SharedDirectivesModule,
        SharedPipesModule,
        RouterModule
      ]
    }]
  }], null, null);
})();

// node_modules/angular-in-memory-web-api/fesm2022/angular-in-memory-web-api.mjs
function delayResponse(response$, delayMs) {
  return new Observable((observer) => {
    let completePending = false;
    let nextPending = false;
    const subscription = response$.subscribe((value) => {
      nextPending = true;
      setTimeout(() => {
        observer.next(value);
        if (completePending) {
          observer.complete();
        }
      }, delayMs);
    }, (error) => setTimeout(() => observer.error(error), delayMs), () => {
      completePending = true;
      if (!nextPending) {
        observer.complete();
      }
    });
    return () => {
      return subscription.unsubscribe();
    };
  });
}
var STATUS = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANTENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  UPGRADE_REQUIRED: 426,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  PROCESSING: 102,
  MULTI_STATUS: 207,
  IM_USED: 226,
  PERMANENT_REDIRECT: 308,
  UNPROCESSABLE_ENTRY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
var STATUS_CODE_INFO = {
  "100": {
    "code": 100,
    "text": "Continue",
    "description": '"The initial part of a request has been received and has not yet been rejected by the server."',
    "spec_title": "RFC7231#6.2.1",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.2.1"
  },
  "101": {
    "code": 101,
    "text": "Switching Protocols",
    "description": `"The server understands and is willing to comply with the client's request, via the Upgrade header field, for a change in the application protocol being used on this connection."`,
    "spec_title": "RFC7231#6.2.2",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.2.2"
  },
  "200": {
    "code": 200,
    "text": "OK",
    "description": '"The request has succeeded."',
    "spec_title": "RFC7231#6.3.1",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.1"
  },
  "201": {
    "code": 201,
    "text": "Created",
    "description": '"The request has been fulfilled and has resulted in one or more new resources being created."',
    "spec_title": "RFC7231#6.3.2",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.2"
  },
  "202": {
    "code": 202,
    "text": "Accepted",
    "description": '"The request has been accepted for processing, but the processing has not been completed."',
    "spec_title": "RFC7231#6.3.3",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.3"
  },
  "203": {
    "code": 203,
    "text": "Non-Authoritative Information",
    "description": `"The request was successful but the enclosed payload has been modified from that of the origin server's 200 (OK) response by a transforming proxy."`,
    "spec_title": "RFC7231#6.3.4",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.4"
  },
  "204": {
    "code": 204,
    "text": "No Content",
    "description": '"The server has successfully fulfilled the request and that there is no additional content to send in the response payload body."',
    "spec_title": "RFC7231#6.3.5",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.5"
  },
  "205": {
    "code": 205,
    "text": "Reset Content",
    "description": '"The server has fulfilled the request and desires that the user agent reset the "document view", which caused the request to be sent, to its original state as received from the origin server."',
    "spec_title": "RFC7231#6.3.6",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.6"
  },
  "206": {
    "code": 206,
    "text": "Partial Content",
    "description": `"The server is successfully fulfilling a range request for the target resource by transferring one or more parts of the selected representation that correspond to the satisfiable ranges found in the requests's Range header field."`,
    "spec_title": "RFC7233#4.1",
    "spec_href": "https://tools.ietf.org/html/rfc7233#section-4.1"
  },
  "300": {
    "code": 300,
    "text": "Multiple Choices",
    "description": '"The target resource has more than one representation, each with its own more specific identifier, and information about the alternatives is being provided so that the user (or user agent) can select a preferred representation by redirecting its request to one or more of those identifiers."',
    "spec_title": "RFC7231#6.4.1",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.4.1"
  },
  "301": {
    "code": 301,
    "text": "Moved Permanently",
    "description": '"The target resource has been assigned a new permanent URI and any future references to this resource ought to use one of the enclosed URIs."',
    "spec_title": "RFC7231#6.4.2",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.4.2"
  },
  "302": {
    "code": 302,
    "text": "Found",
    "description": '"The target resource resides temporarily under a different URI."',
    "spec_title": "RFC7231#6.4.3",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.4.3"
  },
  "303": {
    "code": 303,
    "text": "See Other",
    "description": '"The server is redirecting the user agent to a different resource, as indicated by a URI in the Location header field, that is intended to provide an indirect response to the original request."',
    "spec_title": "RFC7231#6.4.4",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.4.4"
  },
  "304": {
    "code": 304,
    "text": "Not Modified",
    "description": '"A conditional GET request has been received and would have resulted in a 200 (OK) response if it were not for the fact that the condition has evaluated to false."',
    "spec_title": "RFC7232#4.1",
    "spec_href": "https://tools.ietf.org/html/rfc7232#section-4.1"
  },
  "305": {
    "code": 305,
    "text": "Use Proxy",
    "description": "*deprecated*",
    "spec_title": "RFC7231#6.4.5",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.4.5"
  },
  "307": {
    "code": 307,
    "text": "Temporary Redirect",
    "description": '"The target resource resides temporarily under a different URI and the user agent MUST NOT change the request method if it performs an automatic redirection to that URI."',
    "spec_title": "RFC7231#6.4.7",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.4.7"
  },
  "400": {
    "code": 400,
    "text": "Bad Request",
    "description": '"The server cannot or will not process the request because the received syntax is invalid, nonsensical, or exceeds some limitation on what the server is willing to process."',
    "spec_title": "RFC7231#6.5.1",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.1"
  },
  "401": {
    "code": 401,
    "text": "Unauthorized",
    "description": '"The request has not been applied because it lacks valid authentication credentials for the target resource."',
    "spec_title": "RFC7235#6.3.1",
    "spec_href": "https://tools.ietf.org/html/rfc7235#section-3.1"
  },
  "402": {
    "code": 402,
    "text": "Payment Required",
    "description": "*reserved*",
    "spec_title": "RFC7231#6.5.2",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.2"
  },
  "403": {
    "code": 403,
    "text": "Forbidden",
    "description": '"The server understood the request but refuses to authorize it."',
    "spec_title": "RFC7231#6.5.3",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.3"
  },
  "404": {
    "code": 404,
    "text": "Not Found",
    "description": '"The origin server did not find a current representation for the target resource or is not willing to disclose that one exists."',
    "spec_title": "RFC7231#6.5.4",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.4"
  },
  "405": {
    "code": 405,
    "text": "Method Not Allowed",
    "description": '"The method specified in the request-line is known by the origin server but not supported by the target resource."',
    "spec_title": "RFC7231#6.5.5",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.5"
  },
  "406": {
    "code": 406,
    "text": "Not Acceptable",
    "description": '"The target resource does not have a current representation that would be acceptable to the user agent, according to the proactive negotiation header fields received in the request, and the server is unwilling to supply a default representation."',
    "spec_title": "RFC7231#6.5.6",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.6"
  },
  "407": {
    "code": 407,
    "text": "Proxy Authentication Required",
    "description": '"The client needs to authenticate itself in order to use a proxy."',
    "spec_title": "RFC7231#6.3.2",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.3.2"
  },
  "408": {
    "code": 408,
    "text": "Request Timeout",
    "description": '"The server did not receive a complete request message within the time that it was prepared to wait."',
    "spec_title": "RFC7231#6.5.7",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.7"
  },
  "409": {
    "code": 409,
    "text": "Conflict",
    "description": '"The request could not be completed due to a conflict with the current state of the resource."',
    "spec_title": "RFC7231#6.5.8",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.8"
  },
  "410": {
    "code": 410,
    "text": "Gone",
    "description": '"Access to the target resource is no longer available at the origin server and that this condition is likely to be permanent."',
    "spec_title": "RFC7231#6.5.9",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.9"
  },
  "411": {
    "code": 411,
    "text": "Length Required",
    "description": '"The server refuses to accept the request without a defined Content-Length."',
    "spec_title": "RFC7231#6.5.10",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.10"
  },
  "412": {
    "code": 412,
    "text": "Precondition Failed",
    "description": '"One or more preconditions given in the request header fields evaluated to false when tested on the server."',
    "spec_title": "RFC7232#4.2",
    "spec_href": "https://tools.ietf.org/html/rfc7232#section-4.2"
  },
  "413": {
    "code": 413,
    "text": "Payload Too Large",
    "description": '"The server is refusing to process a request because the request payload is larger than the server is willing or able to process."',
    "spec_title": "RFC7231#6.5.11",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.11"
  },
  "414": {
    "code": 414,
    "text": "URI Too Long",
    "description": '"The server is refusing to service the request because the request-target is longer than the server is willing to interpret."',
    "spec_title": "RFC7231#6.5.12",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.12"
  },
  "415": {
    "code": 415,
    "text": "Unsupported Media Type",
    "description": '"The origin server is refusing to service the request because the payload is in a format not supported by the target resource for this method."',
    "spec_title": "RFC7231#6.5.13",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.13"
  },
  "416": {
    "code": 416,
    "text": "Range Not Satisfiable",
    "description": `"None of the ranges in the request's Range header field overlap the current extent of the selected resource or that the set of ranges requested has been rejected due to invalid ranges or an excessive request of small or overlapping ranges."`,
    "spec_title": "RFC7233#4.4",
    "spec_href": "https://tools.ietf.org/html/rfc7233#section-4.4"
  },
  "417": {
    "code": 417,
    "text": "Expectation Failed",
    "description": `"The expectation given in the request's Expect header field could not be met by at least one of the inbound servers."`,
    "spec_title": "RFC7231#6.5.14",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.14"
  },
  "418": {
    "code": 418,
    "text": "I'm a teapot",
    "description": '"1988 April Fools Joke. Returned by tea pots requested to brew coffee."',
    "spec_title": "RFC 2324",
    "spec_href": "https://tools.ietf.org/html/rfc2324"
  },
  "426": {
    "code": 426,
    "text": "Upgrade Required",
    "description": '"The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol."',
    "spec_title": "RFC7231#6.5.15",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.5.15"
  },
  "500": {
    "code": 500,
    "text": "Internal Server Error",
    "description": '"The server encountered an unexpected condition that prevented it from fulfilling the request."',
    "spec_title": "RFC7231#6.6.1",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.6.1"
  },
  "501": {
    "code": 501,
    "text": "Not Implemented",
    "description": '"The server does not support the functionality required to fulfill the request."',
    "spec_title": "RFC7231#6.6.2",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.6.2"
  },
  "502": {
    "code": 502,
    "text": "Bad Gateway",
    "description": '"The server, while acting as a gateway or proxy, received an invalid response from an inbound server it accessed while attempting to fulfill the request."',
    "spec_title": "RFC7231#6.6.3",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.6.3"
  },
  "503": {
    "code": 503,
    "text": "Service Unavailable",
    "description": '"The server is currently unable to handle the request due to a temporary overload or scheduled maintenance, which will likely be alleviated after some delay."',
    "spec_title": "RFC7231#6.6.4",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.6.4"
  },
  "504": {
    "code": 504,
    "text": "Gateway Time-out",
    "description": '"The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server it needed to access in order to complete the request."',
    "spec_title": "RFC7231#6.6.5",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.6.5"
  },
  "505": {
    "code": 505,
    "text": "HTTP Version Not Supported",
    "description": '"The server does not support, or refuses to support, the protocol version that was used in the request message."',
    "spec_title": "RFC7231#6.6.6",
    "spec_href": "https://tools.ietf.org/html/rfc7231#section-6.6.6"
  },
  "102": {
    "code": 102,
    "text": "Processing",
    "description": '"An interim response to inform the client that the server has accepted the complete request, but has not yet completed it."',
    "spec_title": "RFC5218#10.1",
    "spec_href": "https://tools.ietf.org/html/rfc2518#section-10.1"
  },
  "207": {
    "code": 207,
    "text": "Multi-Status",
    "description": '"Status for multiple independent operations."',
    "spec_title": "RFC5218#10.2",
    "spec_href": "https://tools.ietf.org/html/rfc2518#section-10.2"
  },
  "226": {
    "code": 226,
    "text": "IM Used",
    "description": '"The server has fulfilled a GET request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance."',
    "spec_title": "RFC3229#10.4.1",
    "spec_href": "https://tools.ietf.org/html/rfc3229#section-10.4.1"
  },
  "308": {
    "code": 308,
    "text": "Permanent Redirect",
    "description": '"The target resource has been assigned a new permanent URI and any future references to this resource SHOULD use one of the returned URIs. [...] This status code is similar to 301 Moved Permanently (Section 7.3.2 of rfc7231), except that it does not allow rewriting the request method from POST to GET."',
    "spec_title": "RFC7238",
    "spec_href": "https://tools.ietf.org/html/rfc7238"
  },
  "422": {
    "code": 422,
    "text": "Unprocessable Entity",
    "description": '"The server understands the content type of the request entity (hence a 415(Unsupported Media Type) status code is inappropriate), and the syntax of the request entity is correct (thus a 400 (Bad Request) status code is inappropriate) but was unable to process the contained instructions."',
    "spec_title": "RFC5218#10.3",
    "spec_href": "https://tools.ietf.org/html/rfc2518#section-10.3"
  },
  "423": {
    "code": 423,
    "text": "Locked",
    "description": '"The source or destination resource of a method is locked."',
    "spec_title": "RFC5218#10.4",
    "spec_href": "https://tools.ietf.org/html/rfc2518#section-10.4"
  },
  "424": {
    "code": 424,
    "text": "Failed Dependency",
    "description": '"The method could not be performed on the resource because the requested action depended on another action and that action failed."',
    "spec_title": "RFC5218#10.5",
    "spec_href": "https://tools.ietf.org/html/rfc2518#section-10.5"
  },
  "428": {
    "code": 428,
    "text": "Precondition Required",
    "description": '"The origin server requires the request to be conditional."',
    "spec_title": "RFC6585#3",
    "spec_href": "https://tools.ietf.org/html/rfc6585#section-3"
  },
  "429": {
    "code": 429,
    "text": "Too Many Requests",
    "description": '"The user has sent too many requests in a given amount of time ("rate limiting")."',
    "spec_title": "RFC6585#4",
    "spec_href": "https://tools.ietf.org/html/rfc6585#section-4"
  },
  "431": {
    "code": 431,
    "text": "Request Header Fields Too Large",
    "description": '"The server is unwilling to process the request because its header fields are too large."',
    "spec_title": "RFC6585#5",
    "spec_href": "https://tools.ietf.org/html/rfc6585#section-5"
  },
  "451": {
    "code": 451,
    "text": "Unavailable For Legal Reasons",
    "description": '"The server is denying access to the resource in response to a legal demand."',
    "spec_title": "draft-ietf-httpbis-legally-restricted-status",
    "spec_href": "https://tools.ietf.org/html/draft-ietf-httpbis-legally-restricted-status"
  },
  "506": {
    "code": 506,
    "text": "Variant Also Negotiates",
    "description": '"The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process."',
    "spec_title": "RFC2295#8.1",
    "spec_href": "https://tools.ietf.org/html/rfc2295#section-8.1"
  },
  "507": {
    "code": 507,
    "text": "Insufficient Storage",
    "description": 'The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request."',
    "spec_title": "RFC5218#10.6",
    "spec_href": "https://tools.ietf.org/html/rfc2518#section-10.6"
  },
  "511": {
    "code": 511,
    "text": "Network Authentication Required",
    "description": '"The client needs to authenticate to gain network access."',
    "spec_title": "RFC6585#6",
    "spec_href": "https://tools.ietf.org/html/rfc6585#section-6"
  }
};
function getStatusText(code) {
  return STATUS_CODE_INFO[code + ""].text || "Unknown Status";
}
function isSuccess(status) {
  return status >= 200 && status < 300;
}
var InMemoryDbService = class {
};
var InMemoryBackendConfigArgs = class {
  /**
   * The base path to the api, e.g, 'api/'.
   * If not specified than `parseRequestUrl` assumes it is the first path segment in the request.
   */
  apiBase;
  /**
   * false (default) if search match should be case insensitive
   */
  caseSensitiveSearch;
  /**
   * false (default) put content directly inside the response body.
   * true: encapsulate content in a `data` property inside the response body, `{ data: ... }`.
   */
  dataEncapsulation;
  /**
   * delay (in ms) to simulate latency
   */
  delay;
  /**
   * false (default) should 204 when object-to-delete not found; true: 404
   */
  delete404;
  /**
   * host for this service, e.g., 'localhost'
   */
  host;
  /**
   * true, should pass unrecognized request URL through to original backend; false (default): 404
   */
  passThruUnknownUrl;
  /**
   * true (default) should NOT return the item (204) after a POST. false: return the item (200).
   */
  post204;
  /**
   * false (default) should NOT update existing item with POST. false: OK to update.
   */
  post409;
  /**
   * true (default) should NOT return the item (204) after a POST. false: return the item (200).
   */
  put204;
  /**
   * false (default) if item not found, create as new item; false: should 404.
   */
  put404;
  /**
   * root path _before_ any API call, e.g., ''
   */
  rootPath;
};
var InMemoryBackendConfig = class _InMemoryBackendConfig {
  constructor(config = {}) {
    Object.assign(this, {
      // default config:
      caseSensitiveSearch: false,
      dataEncapsulation: false,
      // do NOT wrap content within an object with a `data` property
      delay: 500,
      // simulate latency by delaying response
      delete404: false,
      // don't complain if can't find entity to delete
      passThruUnknownUrl: false,
      // 404 if can't process URL
      post204: true,
      // don't return the item after a POST
      post409: false,
      // don't update existing item with that ID
      put204: true,
      // don't return the item after a PUT
      put404: false,
      // create new item if PUT item with that ID not found
      apiBase: void 0,
      // assumed to be the first path segment
      host: void 0,
      // default value is actually set in InMemoryBackendService ctor
      rootPath: void 0
      // default value is actually set in InMemoryBackendService ctor
    }, config);
  }
  static \u0275fac = function InMemoryBackendConfig_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _InMemoryBackendConfig)(\u0275\u0275inject(InMemoryBackendConfigArgs));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _InMemoryBackendConfig,
    factory: _InMemoryBackendConfig.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InMemoryBackendConfig, [{
    type: Injectable
  }], () => [{
    type: InMemoryBackendConfigArgs
  }], null);
})();
function parseUri(str) {
  const URL_REGEX = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
  const m = URL_REGEX.exec(str);
  const uri = {
    source: "",
    protocol: "",
    authority: "",
    userInfo: "",
    user: "",
    password: "",
    host: "",
    port: "",
    relative: "",
    path: "",
    directory: "",
    file: "",
    query: "",
    anchor: ""
  };
  const keys = Object.keys(uri);
  let i = keys.length;
  while (i--) {
    uri[keys[i]] = m && m[i] || "";
  }
  return uri;
}
function removeTrailingSlash(path) {
  return path.replace(/\/$/, "");
}
var BackendService = class {
  inMemDbService;
  config = new InMemoryBackendConfig();
  db = {};
  dbReadySubject;
  passThruBackend;
  requestInfoUtils = this.getRequestInfoUtils();
  constructor(inMemDbService, config = {}) {
    this.inMemDbService = inMemDbService;
    const loc = this.getLocation("/");
    this.config.host = loc.host;
    this.config.rootPath = loc.path;
    Object.assign(this.config, config);
  }
  get dbReady() {
    if (!this.dbReadySubject) {
      this.dbReadySubject = new BehaviorSubject(false);
      this.resetDb();
    }
    return this.dbReadySubject.asObservable().pipe(first((r) => r));
  }
  /**
   * Process Request and return an Observable of Http Response object
   * in the manner of a RESTy web api.
   *
   * Expect URI pattern in the form :base/:collectionName/:id?
   * Examples:
   *   // for store with a 'customers' collection
   *   GET api/customers          // all customers
   *   GET api/customers/42       // the character with id=42
   *   GET api/customers?name=^j  // 'j' is a regex; returns customers whose name starts with 'j' or
   * 'J' GET api/customers.json/42  // ignores the ".json"
   *
   * Also accepts direct commands to the service in which the last segment of the apiBase is the
   * word "commands" Examples: POST commands/resetDb, GET/POST commands/config - get or (re)set the
   * config
   *
   *   HTTP overrides:
   *     If the injected inMemDbService defines an HTTP method (lowercase)
   *     The request is forwarded to that method as in
   *     `inMemDbService.get(requestInfo)`
   *     which must return either an Observable of the response type
   *     for this http library or null|undefined (which means "keep processing").
   */
  handleRequest(req) {
    return this.dbReady.pipe(concatMap(() => this.handleRequest_(req)));
  }
  handleRequest_(req) {
    const url = req.urlWithParams ? req.urlWithParams : req.url;
    const parser = this.bind("parseRequestUrl");
    const parsed = parser && parser(url, this.requestInfoUtils) || this.parseRequestUrl(url);
    const collectionName = parsed.collectionName;
    const collection = this.db[collectionName];
    const reqInfo = {
      req,
      apiBase: parsed.apiBase,
      collection,
      collectionName,
      headers: this.createHeaders({
        "Content-Type": "application/json"
      }),
      id: this.parseId(collection, collectionName, parsed.id),
      method: this.getRequestMethod(req),
      query: parsed.query,
      resourceUrl: parsed.resourceUrl,
      url,
      utils: this.requestInfoUtils
    };
    let resOptions;
    if (/commands\/?$/i.test(reqInfo.apiBase)) {
      return this.commands(reqInfo);
    }
    const methodInterceptor = this.bind(reqInfo.method);
    if (methodInterceptor) {
      const interceptorResponse = methodInterceptor(reqInfo);
      if (interceptorResponse) {
        return interceptorResponse;
      }
    }
    if (this.db[collectionName]) {
      return this.createResponse$(() => this.collectionHandler(reqInfo));
    }
    if (this.config.passThruUnknownUrl) {
      return this.getPassThruBackend().handle(req);
    }
    resOptions = this.createErrorResponseOptions(url, STATUS.NOT_FOUND, `Collection '${collectionName}' not found`);
    return this.createResponse$(() => resOptions);
  }
  /**
   * Add configured delay to response observable unless delay === 0
   */
  addDelay(response) {
    const d = this.config.delay;
    return d === 0 ? response : delayResponse(response, d || 500);
  }
  /**
   * Apply query/search parameters as a filter over the collection
   * This impl only supports RegExp queries on string properties of the collection
   * ANDs the conditions together
   */
  applyQuery(collection, query) {
    const conditions = [];
    const caseSensitive = this.config.caseSensitiveSearch ? void 0 : "i";
    query.forEach((value, name) => {
      value.forEach((v) => conditions.push({
        name,
        rx: new RegExp(decodeURI(v), caseSensitive)
      }));
    });
    const len = conditions.length;
    if (!len) {
      return collection;
    }
    return collection.filter((row) => {
      let ok = true;
      let i = len;
      while (ok && i) {
        i -= 1;
        const cond = conditions[i];
        ok = cond.rx.test(row[cond.name]);
      }
      return ok;
    });
  }
  /**
   * Get a method from the `InMemoryDbService` (if it exists), bound to that service
   */
  bind(methodName) {
    const fn = this.inMemDbService[methodName];
    return fn ? fn.bind(this.inMemDbService) : void 0;
  }
  bodify(data) {
    return this.config.dataEncapsulation ? {
      data
    } : data;
  }
  clone(data) {
    return JSON.parse(JSON.stringify(data));
  }
  collectionHandler(reqInfo) {
    let resOptions;
    switch (reqInfo.method) {
      case "get":
        resOptions = this.get(reqInfo);
        break;
      case "post":
        resOptions = this.post(reqInfo);
        break;
      case "put":
        resOptions = this.put(reqInfo);
        break;
      case "delete":
        resOptions = this.delete(reqInfo);
        break;
      default:
        resOptions = this.createErrorResponseOptions(reqInfo.url, STATUS.METHOD_NOT_ALLOWED, "Method not allowed");
        break;
    }
    const interceptor = this.bind("responseInterceptor");
    return interceptor ? interceptor(resOptions, reqInfo) : resOptions;
  }
  /**
   * Commands reconfigure the in-memory web api service or extract information from it.
   * Commands ignore the latency delay and respond ASAP.
   *
   * When the last segment of the `apiBase` path is "commands",
   * the `collectionName` is the command.
   *
   * Example URLs:
   *   commands/resetdb (POST) // Reset the "database" to its original state
   *   commands/config (GET)   // Return this service's config object
   *   commands/config (POST)  // Update the config (e.g. the delay)
   *
   * Usage:
   *   http.post('commands/resetdb', undefined);
   *   http.get('commands/config');
   *   http.post('commands/config', '{"delay":1000}');
   */
  commands(reqInfo) {
    const command = reqInfo.collectionName.toLowerCase();
    const method = reqInfo.method;
    let resOptions = {
      url: reqInfo.url
    };
    switch (command) {
      case "resetdb":
        resOptions.status = STATUS.NO_CONTENT;
        return this.resetDb(reqInfo).pipe(concatMap(() => this.createResponse$(
          () => resOptions,
          false
          /* no latency delay */
        )));
      case "config":
        if (method === "get") {
          resOptions.status = STATUS.OK;
          resOptions.body = this.clone(this.config);
        } else {
          const body = this.getJsonBody(reqInfo.req);
          Object.assign(this.config, body);
          this.passThruBackend = void 0;
          resOptions.status = STATUS.NO_CONTENT;
        }
        break;
      default:
        resOptions = this.createErrorResponseOptions(reqInfo.url, STATUS.INTERNAL_SERVER_ERROR, `Unknown command "${command}"`);
    }
    return this.createResponse$(
      () => resOptions,
      false
      /* no latency delay */
    );
  }
  createErrorResponseOptions(url, status, message) {
    return {
      body: {
        error: `${message}`
      },
      url,
      headers: this.createHeaders({
        "Content-Type": "application/json"
      }),
      status
    };
  }
  /**
   * Create a cold response Observable from a factory for ResponseOptions
   * @param resOptionsFactory - creates ResponseOptions when observable is subscribed
   * @param withDelay - if true (default), add simulated latency delay from configuration
   */
  createResponse$(resOptionsFactory, withDelay = true) {
    const resOptions$ = this.createResponseOptions$(resOptionsFactory);
    let resp$ = this.createResponse$fromResponseOptions$(resOptions$);
    return withDelay ? this.addDelay(resp$) : resp$;
  }
  /**
   * Create a cold Observable of ResponseOptions.
   * @param resOptionsFactory - creates ResponseOptions when observable is subscribed
   */
  createResponseOptions$(resOptionsFactory) {
    return new Observable((responseObserver) => {
      let resOptions;
      try {
        resOptions = resOptionsFactory();
      } catch (error) {
        const err = error.message || error;
        resOptions = this.createErrorResponseOptions("", STATUS.INTERNAL_SERVER_ERROR, `${err}`);
      }
      const status = resOptions.status;
      try {
        resOptions.statusText = status != null ? getStatusText(status) : void 0;
      } catch (e) {
      }
      if (status != null && isSuccess(status)) {
        responseObserver.next(resOptions);
        responseObserver.complete();
      } else {
        responseObserver.error(resOptions);
      }
      return () => {
      };
    });
  }
  delete({
    collection,
    collectionName,
    headers,
    id,
    url
  }) {
    if (id == null) {
      return this.createErrorResponseOptions(url, STATUS.NOT_FOUND, `Missing "${collectionName}" id`);
    }
    const exists = this.removeById(collection, id);
    return {
      headers,
      status: exists || !this.config.delete404 ? STATUS.NO_CONTENT : STATUS.NOT_FOUND
    };
  }
  /**
   * Find first instance of item in collection by `item.id`
   * @param collection
   * @param id
   */
  findById(collection, id) {
    return collection.find((item) => item.id === id);
  }
  /**
   * Generate the next available id for item in this collection
   * Use method from `inMemDbService` if it exists and returns a value,
   * else delegates to `genIdDefault`.
   * @param collection - collection of items with `id` key property
   */
  genId(collection, collectionName) {
    const genId = this.bind("genId");
    if (genId) {
      const id = genId(collection, collectionName);
      if (id != null) {
        return id;
      }
    }
    return this.genIdDefault(collection, collectionName);
  }
  /**
   * Default generator of the next available id for item in this collection
   * This default implementation works only for numeric ids.
   * @param collection - collection of items with `id` key property
   * @param collectionName - name of the collection
   */
  genIdDefault(collection, collectionName) {
    if (!this.isCollectionIdNumeric(collection, collectionName)) {
      throw new Error(`Collection '${collectionName}' id type is non-numeric or unknown. Can only generate numeric ids.`);
    }
    let maxId = 0;
    collection.reduce((prev, item) => {
      maxId = Math.max(maxId, typeof item.id === "number" ? item.id : maxId);
    }, void 0);
    return maxId + 1;
  }
  get({
    collection,
    collectionName,
    headers,
    id,
    query,
    url
  }) {
    let data = collection;
    if (id != null && id !== "") {
      data = this.findById(collection, id);
    } else if (query) {
      data = this.applyQuery(collection, query);
    }
    if (!data) {
      return this.createErrorResponseOptions(url, STATUS.NOT_FOUND, `'${collectionName}' with id='${id}' not found`);
    }
    return {
      body: this.bodify(this.clone(data)),
      headers,
      status: STATUS.OK
    };
  }
  /**
   * Get location info from a url, even on server where `document` is not defined
   */
  getLocation(url) {
    if (!url.startsWith("http")) {
      const doc = typeof document === "undefined" ? void 0 : document;
      const base = doc ? doc.location.protocol + "//" + doc.location.host : "http://fake";
      url = url.startsWith("/") ? base + url : base + "/" + url;
    }
    return parseUri(url);
  }
  /**
   * get or create the function that passes unhandled requests
   * through to the "real" backend.
   */
  getPassThruBackend() {
    return this.passThruBackend ? this.passThruBackend : this.passThruBackend = this.createPassThruBackend();
  }
  /**
   * Get utility methods from this service instance.
   * Useful within an HTTP method override
   */
  getRequestInfoUtils() {
    return {
      createResponse$: this.createResponse$.bind(this),
      findById: this.findById.bind(this),
      isCollectionIdNumeric: this.isCollectionIdNumeric.bind(this),
      getConfig: () => this.config,
      getDb: () => this.db,
      getJsonBody: this.getJsonBody.bind(this),
      getLocation: this.getLocation.bind(this),
      getPassThruBackend: this.getPassThruBackend.bind(this),
      parseRequestUrl: this.parseRequestUrl.bind(this)
    };
  }
  indexOf(collection, id) {
    return collection.findIndex((item) => item.id === id);
  }
  /** Parse the id as a number. Return original value if not a number. */
  parseId(collection, collectionName, id) {
    if (!this.isCollectionIdNumeric(collection, collectionName)) {
      return id;
    }
    const idNum = parseFloat(id);
    return isNaN(idNum) ? id : idNum;
  }
  /**
   * return true if can determine that the collection's `item.id` is a number
   * This implementation can't tell if the collection is empty so it assumes NO
   * */
  isCollectionIdNumeric(collection, collectionName) {
    return !!(collection && collection[0]) && typeof collection[0].id === "number";
  }
  /**
   * Parses the request URL into a `ParsedRequestUrl` object.
   * Parsing depends upon certain values of `config`: `apiBase`, `host`, and `urlRoot`.
   *
   * Configuring the `apiBase` yields the most interesting changes to `parseRequestUrl` behavior:
   *   When apiBase=undefined and url='http://localhost/api/collection/42'
   *     {base: 'api/', collectionName: 'collection', id: '42', ...}
   *   When apiBase='some/api/root/' and url='http://localhost/some/api/root/collection'
   *     {base: 'some/api/root/', collectionName: 'collection', id: undefined, ...}
   *   When apiBase='/' and url='http://localhost/collection'
   *     {base: '/', collectionName: 'collection', id: undefined, ...}
   *
   * The actual api base segment values are ignored. Only the number of segments matters.
   * The following api base strings are considered identical: 'a/b' ~ 'some/api/' ~ `two/segments'
   *
   * To replace this default method, assign your alternative to your
   * InMemDbService['parseRequestUrl']
   */
  parseRequestUrl(url) {
    try {
      const loc = this.getLocation(url);
      let drop = (this.config.rootPath || "").length;
      let urlRoot = "";
      if (loc.host !== this.config.host) {
        drop = 1;
        urlRoot = loc.protocol + "//" + loc.host + "/";
      }
      const path = loc.path.substring(drop);
      const pathSegments = path.split("/");
      let segmentIndex = 0;
      let apiBase;
      if (this.config.apiBase == null) {
        apiBase = pathSegments[segmentIndex++];
      } else {
        apiBase = removeTrailingSlash(this.config.apiBase.trim());
        if (apiBase) {
          segmentIndex = apiBase.split("/").length;
        } else {
          segmentIndex = 0;
        }
      }
      apiBase += "/";
      let collectionName = pathSegments[segmentIndex++];
      collectionName = collectionName && collectionName.split(".")[0];
      const id = pathSegments[segmentIndex++];
      const query = this.createQueryMap(loc.query);
      const resourceUrl = urlRoot + apiBase + collectionName + "/";
      return {
        apiBase,
        collectionName,
        id,
        query,
        resourceUrl
      };
    } catch (err) {
      const msg = `unable to parse url '${url}'; original error: ${err.message}`;
      throw new Error(msg);
    }
  }
  // Create entity
  // Can update an existing entity too if post409 is false.
  post({
    collection,
    collectionName,
    headers,
    id,
    req,
    resourceUrl,
    url
  }) {
    const item = this.clone(this.getJsonBody(req));
    if (item.id == null) {
      try {
        item.id = id || this.genId(collection, collectionName);
      } catch (err) {
        const emsg = err.message || "";
        if (/id type is non-numeric/.test(emsg)) {
          return this.createErrorResponseOptions(url, STATUS.UNPROCESSABLE_ENTRY, emsg);
        } else {
          return this.createErrorResponseOptions(url, STATUS.INTERNAL_SERVER_ERROR, `Failed to generate new id for '${collectionName}'`);
        }
      }
    }
    if (id && id !== item.id) {
      return this.createErrorResponseOptions(url, STATUS.BAD_REQUEST, `Request id does not match item.id`);
    } else {
      id = item.id;
    }
    const existingIx = this.indexOf(collection, id);
    const body = this.bodify(item);
    if (existingIx === -1) {
      collection.push(item);
      headers.set("Location", resourceUrl + "/" + id);
      return {
        headers,
        body,
        status: STATUS.CREATED
      };
    } else if (this.config.post409) {
      return this.createErrorResponseOptions(url, STATUS.CONFLICT, `'${collectionName}' item with id='${id} exists and may not be updated with POST; use PUT instead.`);
    } else {
      collection[existingIx] = item;
      return this.config.post204 ? {
        headers,
        status: STATUS.NO_CONTENT
      } : {
        headers,
        body,
        status: STATUS.OK
      };
    }
  }
  // Update existing entity
  // Can create an entity too if put404 is false.
  put({
    collection,
    collectionName,
    headers,
    id,
    req,
    url
  }) {
    const item = this.clone(this.getJsonBody(req));
    if (item.id == null) {
      return this.createErrorResponseOptions(url, STATUS.NOT_FOUND, `Missing '${collectionName}' id`);
    }
    if (id && id !== item.id) {
      return this.createErrorResponseOptions(url, STATUS.BAD_REQUEST, `Request for '${collectionName}' id does not match item.id`);
    } else {
      id = item.id;
    }
    const existingIx = this.indexOf(collection, id);
    const body = this.bodify(item);
    if (existingIx > -1) {
      collection[existingIx] = item;
      return this.config.put204 ? {
        headers,
        status: STATUS.NO_CONTENT
      } : {
        headers,
        body,
        status: STATUS.OK
      };
    } else if (this.config.put404) {
      return this.createErrorResponseOptions(url, STATUS.NOT_FOUND, `'${collectionName}' item with id='${id} not found and may not be created with PUT; use POST instead.`);
    } else {
      collection.push(item);
      return {
        headers,
        body,
        status: STATUS.CREATED
      };
    }
  }
  removeById(collection, id) {
    const ix = this.indexOf(collection, id);
    if (ix > -1) {
      collection.splice(ix, 1);
      return true;
    }
    return false;
  }
  /**
   * Tell your in-mem "database" to reset.
   * returns Observable of the database because resetting it could be async
   */
  resetDb(reqInfo) {
    this.dbReadySubject && this.dbReadySubject.next(false);
    const db = this.inMemDbService.createDb(reqInfo);
    const db$ = db instanceof Observable ? db : typeof db.then === "function" ? from(db) : of(db);
    db$.pipe(first()).subscribe((d) => {
      this.db = d;
      this.dbReadySubject && this.dbReadySubject.next(true);
    });
    return this.dbReady;
  }
};
var HttpClientBackendService = class _HttpClientBackendService extends BackendService {
  xhrFactory;
  constructor(inMemDbService, config, xhrFactory) {
    super(inMemDbService, config);
    this.xhrFactory = xhrFactory;
  }
  handle(req) {
    try {
      return this.handleRequest(req);
    } catch (error) {
      const err = error.message || error;
      const resOptions = this.createErrorResponseOptions(req.url, STATUS.INTERNAL_SERVER_ERROR, `${err}`);
      return this.createResponse$(() => resOptions);
    }
  }
  getJsonBody(req) {
    return req.body;
  }
  getRequestMethod(req) {
    return (req.method || "get").toLowerCase();
  }
  createHeaders(headers) {
    return new HttpHeaders(headers);
  }
  createQueryMap(search) {
    const map2 = /* @__PURE__ */ new Map();
    if (search) {
      const params = new HttpParams({
        fromString: search
      });
      params.keys().forEach((p) => map2.set(p, params.getAll(p) || []));
    }
    return map2;
  }
  createResponse$fromResponseOptions$(resOptions$) {
    return resOptions$.pipe(map((opts) => new HttpResponse(opts)));
  }
  createPassThruBackend() {
    try {
      return new HttpXhrBackend(this.xhrFactory);
    } catch (ex) {
      ex.message = "Cannot create passThru404 backend; " + (ex.message || "");
      throw ex;
    }
  }
  static \u0275fac = function HttpClientBackendService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _HttpClientBackendService)(\u0275\u0275inject(InMemoryDbService), \u0275\u0275inject(InMemoryBackendConfig, 8), \u0275\u0275inject(XhrFactory));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _HttpClientBackendService,
    factory: _HttpClientBackendService.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HttpClientBackendService, [{
    type: Injectable
  }], () => [{
    type: InMemoryDbService
  }, {
    type: InMemoryBackendConfigArgs,
    decorators: [{
      type: Inject,
      args: [InMemoryBackendConfig]
    }, {
      type: Optional
    }]
  }, {
    type: XhrFactory
  }], null);
})();
function httpClientInMemBackendServiceFactory(dbService, options, xhrFactory) {
  return new HttpClientBackendService(dbService, options, xhrFactory);
}
var HttpClientInMemoryWebApiModule = class _HttpClientInMemoryWebApiModule {
  /**
   *  Redirect the Angular `HttpClient` XHR calls
   *  to in-memory data store that implements `InMemoryDbService`.
   *  with class that implements InMemoryDbService and creates an in-memory database.
   *
   *  Usually imported in the root application module.
   *  Can import in a lazy feature module too, which will shadow modules loaded earlier
   *
   *  Note: If you use the `FetchBackend`, make sure forRoot is invoked after in the providers list
   *
   * @param dbCreator - Class that creates seed data for in-memory database. Must implement
   *     InMemoryDbService.
   * @param [options]
   *
   * @example
   * HttpInMemoryWebApiModule.forRoot(dbCreator);
   * HttpInMemoryWebApiModule.forRoot(dbCreator, {useValue: {delay:600}});
   */
  static forRoot(dbCreator, options) {
    return {
      ngModule: _HttpClientInMemoryWebApiModule,
      providers: [{
        provide: InMemoryDbService,
        useClass: dbCreator
      }, {
        provide: InMemoryBackendConfig,
        useValue: options
      }, {
        provide: HttpBackend,
        useFactory: httpClientInMemBackendServiceFactory,
        deps: [InMemoryDbService, InMemoryBackendConfig, XhrFactory]
      }]
    };
  }
  /**
   *
   * Enable and configure the in-memory web api in a lazy-loaded feature module.
   * Same as `forRoot`.
   * This is a feel-good method so you can follow the Angular style guide for lazy-loaded modules.
   */
  static forFeature(dbCreator, options) {
    return _HttpClientInMemoryWebApiModule.forRoot(dbCreator, options);
  }
  static \u0275fac = function HttpClientInMemoryWebApiModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _HttpClientInMemoryWebApiModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _HttpClientInMemoryWebApiModule
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(HttpClientInMemoryWebApiModule, [{
    type: NgModule
  }], null, null);
})();
var InMemoryWebApiModule = class _InMemoryWebApiModule {
  /**
   *  Redirect BOTH Angular `Http` and `HttpClient` XHR calls
   *  to in-memory data store that implements `InMemoryDbService`.
   *  with class that implements InMemoryDbService and creates an in-memory database.
   *
   *  Usually imported in the root application module.
   *  Can import in a lazy feature module too, which will shadow modules loaded earlier
   *
   *  Note: If you use the `FetchBackend`, make sure forRoot is invoked after in the providers list
   *
   * @param dbCreator - Class that creates seed data for in-memory database. Must implement
   *     InMemoryDbService.
   * @param [options]
   *
   * @example
   * InMemoryWebApiModule.forRoot(dbCreator);
   * InMemoryWebApiModule.forRoot(dbCreator, {useValue: {delay:600}});
   */
  static forRoot(dbCreator, options) {
    return {
      ngModule: _InMemoryWebApiModule,
      providers: [{
        provide: InMemoryDbService,
        useClass: dbCreator
      }, {
        provide: InMemoryBackendConfig,
        useValue: options
      }, {
        provide: HttpBackend,
        useFactory: httpClientInMemBackendServiceFactory,
        deps: [InMemoryDbService, InMemoryBackendConfig, XhrFactory]
      }]
    };
  }
  /**
   *
   * Enable and configure the in-memory web api in a lazy-loaded feature module.
   * Same as `forRoot`.
   * This is a feel-good method so you can follow the Angular style guide for lazy-loaded modules.
   */
  static forFeature(dbCreator, options) {
    return _InMemoryWebApiModule.forRoot(dbCreator, options);
  }
  static \u0275fac = function InMemoryWebApiModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _InMemoryWebApiModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _InMemoryWebApiModule
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(InMemoryWebApiModule, [{
    type: NgModule
  }], null, null);
})();

// src/app/shared/inmemory-db/products.ts
var ProductDB = class {
  static {
    this.products = [
      {
        "_id": "5a9ae2106518248b68251fdf",
        "name": "Wireless Bluetooth V4.0 Portable Speaker with HD Sound and Bass",
        "subtitle": "Admodum assentior ad duo",
        "description": "Lorem ipsum dolor sit amet, et nec putent quodsi, admodum assentior ad duo. Pri ad sapientem ocurreret incorrupte",
        "category": "speaker",
        "tags": [
          "sunt",
          "sunt",
          "culpa"
        ],
        "price": {
          "sale": 32,
          "previous": 54
        },
        "ratings": {
          "rating": 3.86,
          "ratingCount": 26
        },
        "features": [
          "aliquip aliquip",
          "nulla laboris",
          "pariatur consequat"
        ],
        "photo": "./assets/images/products/speaker-1.jpg",
        "gallery": [
          "./assets/images/products/speaker-1.jpg",
          "./assets/images/products/speaker-2.jpg"
        ],
        "badge": {
          "text": "20% off",
          "color": "info"
        }
      },
      {
        "_id": "5a9ae210b7b4d3ad2f048bbe",
        "name": "Portable Speaker with HD Sound",
        "subtitle": "Admodum assentior ad duo",
        "description": "cillum eiusmod",
        "category": "speaker",
        "tags": [
          "Lorem",
          "nisi",
          "ad"
        ],
        "price": {
          "sale": 25,
          "previous": 43
        },
        "ratings": {
          "rating": 3.72,
          "ratingCount": 18
        },
        "features": [
          "magna est",
          "consectetur dolor",
          "est proident"
        ],
        "photo": "./assets/images/products/speaker-2.jpg",
        "gallery": [
          "./assets/images/products/speaker-1.jpg",
          "./assets/images/products/speaker-2.jpg"
        ],
        "badge": {
          "text": "Sale",
          "color": "primary"
        }
      },
      {
        "_id": "5a9ae210d9a8d6dda7256417",
        "name": "Lightweight On-Ear Headphones - Black",
        "subtitle": "On-ear fit to minimize noise so you can hear every beat",
        "description": "sit laborum",
        "category": "headphone",
        "tags": [
          "eu",
          "irure",
          "proident"
        ],
        "price": {
          "sale": 29,
          "previous": 55
        },
        "ratings": {
          "rating": 3.79,
          "ratingCount": 77
        },
        "features": [
          "laboris id",
          "magna eu",
          "sint quis"
        ],
        "photo": "./assets/images/products/headphone-2.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "-40%",
          "color": "info"
        }
      },
      {
        "_id": "5a9ae210e8329237332e56d7",
        "name": "Automatic-self-wind mens Watch 5102PR-001 (Certified Pre-owned)",
        "subtitle": "Admodum assentior ad duo",
        "description": "eiusmod elit",
        "category": "watch",
        "tags": [
          "laborum",
          "minim",
          "tempor"
        ],
        "price": {
          "sale": 33,
          "previous": 58
        },
        "ratings": {
          "rating": 4.74,
          "ratingCount": 64
        },
        "features": [
          "cillum ullamco",
          "ad minim",
          "duis exercitation"
        ],
        "photo": "./assets/images/products/watch-1.jpg",
        "gallery": [
          "./assets/images/products/watch-1.jpg",
          "./assets/images/products/watch-2.jpg"
        ],
        "badge": {
          "text": "10% off",
          "color": "info"
        }
      },
      {
        "_id": "5a9ae210cb9937d28c6eca1a",
        "name": "Automatic-self-wind mens Watch 5102PR-001",
        "subtitle": "Admodum assentior ad duo",
        "description": "dolore tempor",
        "category": "watch",
        "tags": [
          "Lorem",
          "dolor",
          "duis"
        ],
        "price": {
          "sale": 38,
          "previous": 50
        },
        "ratings": {
          "rating": 4.43,
          "ratingCount": 98
        },
        "features": [
          "aliquip consequat",
          "excepteur non",
          "aliquip eu"
        ],
        "photo": "./assets/images/products/watch-2.jpg",
        "gallery": [
          "./assets/images/products/watch-1.jpg",
          "./assets/images/products/watch-2.jpg"
        ],
        "badge": {
          "text": "4% off",
          "color": "info"
        }
      },
      {
        "_id": "5a9ae2106f155194e5c95d67",
        "name": "On-Ear Headphones - Black",
        "subtitle": "Admodum assentior ad duo",
        "description": "elit Lorem",
        "category": "headphone",
        "tags": [
          "magna",
          "veniam",
          "sunt"
        ],
        "price": {
          "sale": 38,
          "previous": 54
        },
        "ratings": {
          "rating": 4.84,
          "ratingCount": 52
        },
        "features": [
          "est mollit",
          "adipisicing exercitation",
          "esse incididunt"
        ],
        "photo": "./assets/images/products/headphone-3.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "$4 off",
          "color": "success"
        }
      },
      {
        "_id": "5a9ae2101625a02fee92e27f",
        "name": "In-Ear Headphone",
        "subtitle": "Admodum assentior ad duo",
        "description": "proident non",
        "category": "headphone",
        "tags": [
          "Lorem",
          "occaecat",
          "laborum"
        ],
        "price": {
          "sale": 31,
          "previous": 58
        },
        "ratings": {
          "rating": 3.18,
          "ratingCount": 90
        },
        "features": [
          "ullamco quis",
          "veniam laboris",
          "nulla sunt"
        ],
        "photo": "./assets/images/products/headphone-4.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "$5 off",
          "color": "primary"
        }
      },
      {
        "_id": "5a9ae2108970b01447ec34aa",
        "name": "Duis exercitation nostrud anim",
        "subtitle": "Admodum assentior ad duo",
        "description": "dolore enim",
        "category": "phone",
        "tags": [
          "do",
          "aliqua",
          "irure"
        ],
        "price": {
          "sale": 22,
          "previous": 44
        },
        "ratings": {
          "rating": 3.53,
          "ratingCount": 47
        },
        "features": [
          "sunt laboris",
          "incididunt nulla",
          "ullamco qui"
        ],
        "photo": "./assets/images/products/iphone-2.jpg",
        "gallery": [
          "./assets/images/products/iphone-1.jpg",
          "./assets/images/products/iphone-2.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae2103c04707145e21300",
        "name": "Dolor eu nostrud excepteur",
        "description": "enim fugiat",
        "category": "phone",
        "tags": [
          "laborum",
          "nulla",
          "sit"
        ],
        "price": {
          "sale": 31,
          "previous": 40
        },
        "ratings": {
          "rating": 3.42,
          "ratingCount": 35
        },
        "features": [
          "exercitation excepteur",
          "eiusmod mollit",
          "irure adipisicing"
        ],
        "photo": "./assets/images/products/iphone-1.jpg",
        "gallery": [
          "./assets/images/products/iphone-1.jpg",
          "./assets/images/products/iphone-2.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae21021b2911c97ad6c5b",
        "name": "Over-Ear Headphones, Stereo Lightweight Adjustable Wired Headset",
        "subtitle": "Admodum assentior ad duo",
        "description": "sit commodo",
        "category": "headphone",
        "tags": [
          "adipisicing",
          "labore",
          "voluptate"
        ],
        "price": {
          "sale": 33,
          "previous": 57
        },
        "ratings": {
          "rating": 3.51,
          "ratingCount": 60
        },
        "features": [
          "culpa id",
          "eu excepteur",
          "incididunt aute"
        ],
        "photo": "./assets/images/products/headphone-1.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae2106518248b68251fdf",
        "name": "Wireless Bluetooth V4.0 Portable Speaker with HD Sound and Bass",
        "subtitle": "Admodum assentior ad duo",
        "description": "Lorem ipsum dolor sit amet, et nec putent quodsi, admodum assentior ad duo. Pri ad sapientem ocurreret incorrupte",
        "category": "speaker",
        "tags": [
          "sunt",
          "sunt",
          "culpa"
        ],
        "price": {
          "sale": 32,
          "previous": 54
        },
        "ratings": {
          "rating": 3.86,
          "ratingCount": 26
        },
        "features": [
          "aliquip aliquip",
          "nulla laboris",
          "pariatur consequat"
        ],
        "photo": "./assets/images/products/speaker-1.jpg",
        "gallery": [
          "./assets/images/products/speaker-1.jpg",
          "./assets/images/products/speaker-2.jpg"
        ],
        "badge": {
          "text": "20% off",
          "color": "info"
        }
      },
      {
        "_id": "5a9ae210b7b4d3ad2f048dsbbe",
        "name": "Portable Speaker with HD Sound",
        "subtitle": "Admodum assentior ad duo",
        "description": "cillum eiusmod",
        "category": "speaker",
        "tags": [
          "Lorem",
          "nisi",
          "ad"
        ],
        "price": {
          "sale": 25,
          "previous": 43
        },
        "ratings": {
          "rating": 3.72,
          "ratingCount": 18
        },
        "features": [
          "magna est",
          "consectetur dolor",
          "est proident"
        ],
        "photo": "./assets/images/products/speaker-2.jpg",
        "gallery": [
          "./assets/images/products/speaker-1.jpg",
          "./assets/images/products/speaker-2.jpg"
        ],
        "badge": {
          "text": "Sale",
          "color": "primary"
        }
      },
      {
        "_id": "5a9ae2sd10d9a8d6dda7256417",
        "name": "Lightweight On-Ear Headphones - Black",
        "subtitle": "On-ear fit to minimize noise so you can hear every beat",
        "description": "sit laborum",
        "category": "headphone",
        "tags": [
          "eu",
          "irure",
          "proident"
        ],
        "price": {
          "sale": 29,
          "previous": 55
        },
        "ratings": {
          "rating": 3.79,
          "ratingCount": 77
        },
        "features": [
          "laboris id",
          "magna eu",
          "sint quis"
        ],
        "photo": "./assets/images/products/headphone-2.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "-40%",
          "color": "warning"
        }
      },
      {
        "_id": "5a9ae210e8329fs237332e56d7",
        "name": "Automatic-self-wind mens Watch 5102PR-001 (Certified Pre-owned)",
        "subtitle": "Admodum assentior ad duo",
        "description": "eiusmod elit",
        "category": "watch",
        "tags": [
          "laborum",
          "minim",
          "tempor"
        ],
        "price": {
          "sale": 33,
          "previous": 58
        },
        "ratings": {
          "rating": 4.74,
          "ratingCount": 64
        },
        "features": [
          "cillum ullamco",
          "ad minim",
          "duis exercitation"
        ],
        "photo": "./assets/images/products/watch-1.jpg",
        "gallery": [
          "./assets/images/products/watch-1.jpg",
          "./assets/images/products/watch-2.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae210cba9937d28c6eca1a",
        "name": "Automatic-self-wind mens Watch 5102PR-001",
        "subtitle": "Admodum assentior ad duo",
        "description": "dolore tempor",
        "category": "watch",
        "tags": [
          "Lorem",
          "dolor",
          "duis"
        ],
        "price": {
          "sale": 38,
          "previous": 50
        },
        "ratings": {
          "rating": 4.43,
          "ratingCount": 98
        },
        "features": [
          "aliquip consequat",
          "excepteur non",
          "aliquip eu"
        ],
        "photo": "./assets/images/products/watch-2.jpg",
        "gallery": [
          "./assets/images/products/watch-1.jpg",
          "./assets/images/products/watch-2.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5ad9ae2106f155194e5c95d67",
        "name": "On-Ear Headphones - Black",
        "subtitle": "Admodum assentior ad duo",
        "description": "elit Lorem",
        "category": "headphone",
        "tags": [
          "magna",
          "veniam",
          "sunt"
        ],
        "price": {
          "sale": 38,
          "previous": 54
        },
        "ratings": {
          "rating": 4.84,
          "ratingCount": 52
        },
        "features": [
          "est mollit",
          "adipisicing exercitation",
          "esse incididunt"
        ],
        "photo": "./assets/images/products/headphone-3.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae2101625a02fee92fe27f",
        "name": "In-Ear Headphone",
        "subtitle": "Admodum assentior ad duo",
        "description": "proident non",
        "category": "headphone",
        "tags": [
          "Lorem",
          "occaecat",
          "laborum"
        ],
        "price": {
          "sale": 31,
          "previous": 58
        },
        "ratings": {
          "rating": 3.18,
          "ratingCount": 90
        },
        "features": [
          "ullamco quis",
          "veniam laboris",
          "nulla sunt"
        ],
        "photo": "./assets/images/products/headphone-4.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae2108970bs01447ec34aa",
        "name": "Duis exercitation nostrud anim",
        "subtitle": "Admodum assentior ad duo",
        "description": "dolore enim",
        "category": "phone",
        "tags": [
          "do",
          "aliqua",
          "irure"
        ],
        "price": {
          "sale": 22,
          "previous": 44
        },
        "ratings": {
          "rating": 3.53,
          "ratingCount": 47
        },
        "features": [
          "sunt laboris",
          "incididunt nulla",
          "ullamco qui"
        ],
        "photo": "./assets/images/products/iphone-2.jpg",
        "gallery": [
          "./assets/images/products/iphone-1.jpg",
          "./assets/images/products/iphone-2.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9ae2103c0470f7145e21300",
        "name": "Dolor eu nostrud excepteur",
        "description": "enim fugiat",
        "category": "phone",
        "tags": [
          "laborum",
          "nulla",
          "sit"
        ],
        "price": {
          "sale": 31,
          "previous": 40
        },
        "ratings": {
          "rating": 3.42,
          "ratingCount": 35
        },
        "features": [
          "exercitation excepteur",
          "eiusmod mollit",
          "irure adipisicing"
        ],
        "photo": "./assets/images/products/iphone-1.jpg",
        "gallery": [
          "./assets/images/products/iphone-1.jpg",
          "./assets/images/products/iphone-2.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      },
      {
        "_id": "5a9aef21021b2911c97ad6c5b",
        "name": "Over-Ear Headphones, Stereo Lightweight Adjustable Wired Headset",
        "subtitle": "Admodum assentior ad duo",
        "description": "sit commodo",
        "category": "headphone",
        "tags": [
          "adipisicing",
          "labore",
          "voluptate"
        ],
        "price": {
          "sale": 33,
          "previous": 57
        },
        "ratings": {
          "rating": 3.51,
          "ratingCount": 60
        },
        "features": [
          "culpa id",
          "eu excepteur",
          "incididunt aute"
        ],
        "photo": "./assets/images/products/headphone-1.jpg",
        "gallery": [
          "./assets/images/products/headphone-1.jpg",
          "./assets/images/products/headphone-2.jpg",
          "./assets/images/products/headphone-3.jpg",
          "./assets/images/products/headphone-4.jpg"
        ],
        "badge": {
          "text": "",
          "color": "red"
        }
      }
    ];
  }
};

// src/app/shared/inmemory-db/mails.ts
var MailDB = class {
  static {
    this.messages = [
      {
        sender: {
          name: "Henrik Gevorg",
          photo: "assets/images/faces/2.jpg"
        },
        date: /* @__PURE__ */ new Date("1/25/2018"),
        selected: false,
        subject: "Welcome to Angular World",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote class="blockquote">
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Gevorg Spartak",
          photo: "assets/images/faces/3.jpg"
        },
        date: /* @__PURE__ */ new Date("4/3/2017"),
        selected: false,
        subject: "Confirm your email address",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>

              Thanks<br>
              Mark`
      },
      {
        sender: {
          name: "Petros Toros",
          photo: "assets/images/faces/4.jpg"
        },
        date: /* @__PURE__ */ new Date("1/20/2017"),
        selected: false,
        subject: "New order informations",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote class="blockquote">
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Henrik Gevorg",
          photo: "assets/images/faces/5.jpg"
        },
        date: /* @__PURE__ */ new Date("1/8/2017"),
        selected: false,
        subject: "Welcome to Angular Gull",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Gevorg Spartak",
          photo: "assets/images/faces/9.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2016"),
        selected: false,
        subject: "Confirm your email address",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote><br>
              Thanks<br>
              Mark`
      },
      {
        sender: {
          name: "Petros Toros",
          photo: "assets/images/faces/10.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2015"),
        selected: false,
        subject: "New order informations",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Henrik Gevorg",
          photo: "assets/images/faces/15.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2015"),
        selected: false,
        subject: "Welcome to Angular Gull",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Gevorg Spartak",
          photo: "assets/images/faces/12.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2015"),
        selected: false,
        subject: "Confirm your email address",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote><br>
              Thanks<br>
              Mark`
      },
      {
        sender: {
          name: "Petros Toros",
          photo: "assets/images/faces/13.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2015"),
        selected: false,
        subject: "New order informations",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Gevorg Spartak",
          photo: "assets/images/faces/16.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2015"),
        selected: false,
        subject: "Confirm your email address",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote><br>
              Thanks<br>
              Mark`
      },
      {
        sender: {
          name: "Petros Toros",
          photo: "assets/images/faces/17.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2015"),
        selected: false,
        subject: "New order informations",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p><br>
              Thanks<br>
              Jhone`
      },
      {
        sender: {
          name: "Gevorg Spartak",
          photo: "assets/images/faces/2.jpg"
        },
        date: /* @__PURE__ */ new Date("10/3/2012"),
        selected: false,
        subject: "Confirm your email address",
        message: `<p>Natus consequuntur perspiciatis esse beatae illo quos eaque.</p>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote>
              <p>Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi. Iusto ipsam, nihil? Eveniet modi maxime animi excepturi a dignissimos doloribus,
              inventore sed ratione, ducimus atque earum maiores tenetur officia commodi dicta tempora consequatur non nesciunt ipsam,
              consequuntur quia fuga aspernatur impedit et? Natus, earum.</p>
              <blockquote>
              Earum, quisquam, fugit? Numquam dolor magni nisi? Suscipit odit, ipsam iusto enim culpa,
              temporibus vero possimus error voluptates sequi.
              </blockquote><br>
              Thanks<br>
              Mark`
      }
    ];
  }
};

// src/app/shared/inmemory-db/countries.ts
var CountryDB = class {
  static {
    this.countries = [
      { display: "Afghanistan", value: "AF" },
      { display: "\xC5land Islands", value: "AX" },
      { display: "Albania", value: "AL" },
      { display: "Algeria", value: "DZ" },
      { display: "American Samoa", value: "AS" },
      { display: "AndorrA", value: "AD" },
      { display: "Angola", value: "AO" },
      { display: "Anguilla", value: "AI" },
      { display: "Antarctica", value: "AQ" },
      { display: "Antigua and Barbuda", value: "AG" },
      { display: "Argentina", value: "AR" },
      { display: "Armenia", value: "AM" },
      { display: "Aruba", value: "AW" },
      { display: "Australia", value: "AU" },
      { display: "Austria", value: "AT" },
      { display: "Azerbaijan", value: "AZ" },
      { display: "Bahamas", value: "BS" },
      { display: "Bahrain", value: "BH" },
      { display: "Bangladesh", value: "BD" },
      { display: "Barbados", value: "BB" },
      { display: "Belarus", value: "BY" },
      { display: "Belgium", value: "BE" },
      { display: "Belize", value: "BZ" },
      { display: "Benin", value: "BJ" },
      { display: "Bermuda", value: "BM" },
      { display: "Bhutan", value: "BT" },
      { display: "Bolivia", value: "BO" },
      { display: "Bosnia and Herzegovina", value: "BA" },
      { display: "Botswana", value: "BW" },
      { display: "Bouvet Island", value: "BV" },
      { display: "Brazil", value: "BR" },
      { display: "British Indian Ocean Territory", value: "IO" },
      { display: "Brunei Darussalam", value: "BN" },
      { display: "Bulgaria", value: "BG" },
      { display: "Burkina Faso", value: "BF" },
      { display: "Burundi", value: "BI" },
      { display: "Cambodia", value: "KH" },
      { display: "Cameroon", value: "CM" },
      { display: "Canada", value: "CA" },
      { display: "Cape Verde", value: "CV" },
      { display: "Cayman Islands", value: "KY" },
      { display: "Central African Republic", value: "CF" },
      { display: "Chad", value: "TD" },
      { display: "Chile", value: "CL" },
      { display: "China", value: "CN" },
      { display: "Christmas Island", value: "CX" },
      { display: "Cocos (Keeling) Islands", value: "CC" },
      { display: "Colombia", value: "CO" },
      { display: "Comoros", value: "KM" },
      { display: "Congo", value: "CG" },
      { display: "Congo, The Democratic Republic of the", value: "CD" },
      { display: "Cook Islands", value: "CK" },
      { display: "Costa Rica", value: "CR" },
      { display: "Cote D'Ivoire", value: "CI" },
      { display: "Croatia", value: "HR" },
      { display: "Cuba", value: "CU" },
      { display: "Cyprus", value: "CY" },
      { display: "Czech Republic", value: "CZ" },
      { display: "Denmark", value: "DK" },
      { display: "Djibouti", value: "DJ" },
      { display: "Dominica", value: "DM" },
      { display: "Dominican Republic", value: "DO" },
      { display: "Ecuador", value: "EC" },
      { display: "Egypt", value: "EG" },
      { display: "El Salvador", value: "SV" },
      { display: "Equatorial Guinea", value: "GQ" },
      { display: "Eritrea", value: "ER" },
      { display: "Estonia", value: "EE" },
      { display: "Ethiopia", value: "ET" },
      { display: "Falkland Islands (Malvinas)", value: "FK" },
      { display: "Faroe Islands", value: "FO" },
      { display: "Fiji", value: "FJ" },
      { display: "Finland", value: "FI" },
      { display: "France", value: "FR" },
      { display: "French Guiana", value: "GF" },
      { display: "French Polynesia", value: "PF" },
      { display: "French Southern Territories", value: "TF" },
      { display: "Gabon", value: "GA" },
      { display: "Gambia", value: "GM" },
      { display: "Georgia", value: "GE" },
      { display: "Germany", value: "DE" },
      { display: "Ghana", value: "GH" },
      { display: "Gibraltar", value: "GI" },
      { display: "Greece", value: "GR" },
      { display: "Greenland", value: "GL" },
      { display: "Grenada", value: "GD" },
      { display: "Guadeloupe", value: "GP" },
      { display: "Guam", value: "GU" },
      { display: "Guatemala", value: "GT" },
      { display: "Guernsey", value: "GG" },
      { display: "Guinea", value: "GN" },
      { display: "Guinea-Bissau", value: "GW" },
      { display: "Guyana", value: "GY" },
      { display: "Haiti", value: "HT" },
      { display: "Heard Island and Mcdonald Islands", value: "HM" },
      { display: "Holy See (Vatican City State)", value: "VA" },
      { display: "Honduras", value: "HN" },
      { display: "Hong Kong", value: "HK" },
      { display: "Hungary", value: "HU" },
      { display: "Iceland", value: "IS" },
      { display: "India", value: "IN" },
      { display: "Indonesia", value: "ID" },
      { display: "Iran, Islamic Republic Of", value: "IR" },
      { display: "Iraq", value: "IQ" },
      { display: "Ireland", value: "IE" },
      { display: "Isle of Man", value: "IM" },
      { display: "Israel", value: "IL" },
      { display: "Italy", value: "IT" },
      { display: "Jamaica", value: "JM" },
      { display: "Japan", value: "JP" },
      { display: "Jersey", value: "JE" },
      { display: "Jordan", value: "JO" },
      { display: "Kazakhstan", value: "KZ" },
      { display: "Kenya", value: "KE" },
      { display: "Kiribati", value: "KI" },
      { display: "Korea, Democratic People'S Republic of", value: "KP" },
      { display: "Korea, Republic of", value: "KR" },
      { display: "Kuwait", value: "KW" },
      { display: "Kyrgyzstan", value: "KG" },
      { display: "Lao People'S Democratic Republic", value: "LA" },
      { display: "Latvia", value: "LV" },
      { display: "Lebanon", value: "LB" },
      { display: "Lesotho", value: "LS" },
      { display: "Liberia", value: "LR" },
      { display: "Libyan Arab Jamahiriya", value: "LY" },
      { display: "Liechtenstein", value: "LI" },
      { display: "Lithuania", value: "LT" },
      { display: "Luxembourg", value: "LU" },
      { display: "Macao", value: "MO" },
      { display: "Macedonia, The Former Yugoslav Republic of", value: "MK" },
      { display: "Madagascar", value: "MG" },
      { display: "Malawi", value: "MW" },
      { display: "Malaysia", value: "MY" },
      { display: "Maldives", value: "MV" },
      { display: "Mali", value: "ML" },
      { display: "Malta", value: "MT" },
      { display: "Marshall Islands", value: "MH" },
      { display: "Martinique", value: "MQ" },
      { display: "Mauritania", value: "MR" },
      { display: "Mauritius", value: "MU" },
      { display: "Mayotte", value: "YT" },
      { display: "Mexico", value: "MX" },
      { display: "Micronesia, Federated States of", value: "FM" },
      { display: "Moldova, Republic of", value: "MD" },
      { display: "Monaco", value: "MC" },
      { display: "Mongolia", value: "MN" },
      { display: "Montserrat", value: "MS" },
      { display: "Morocco", value: "MA" },
      { display: "Mozambique", value: "MZ" },
      { display: "Myanmar", value: "MM" },
      { display: "Namibia", value: "NA" },
      { display: "Nauru", value: "NR" },
      { display: "Nepal", value: "NP" },
      { display: "Netherlands", value: "NL" },
      { display: "Netherlands Antilles", value: "AN" },
      { display: "New Caledonia", value: "NC" },
      { display: "New Zealand", value: "NZ" },
      { display: "Nicaragua", value: "NI" },
      { display: "Niger", value: "NE" },
      { display: "Nigeria", value: "NG" },
      { display: "Niue", value: "NU" },
      { display: "Norfolk Island", value: "NF" },
      { display: "Northern Mariana Islands", value: "MP" },
      { display: "Norway", value: "NO" },
      { display: "Oman", value: "OM" },
      { display: "Pakistan", value: "PK" },
      { display: "Palau", value: "PW" },
      { display: "Palestinian Territory, Occupied", value: "PS" },
      { display: "Panama", value: "PA" },
      { display: "Papua New Guinea", value: "PG" },
      { display: "Paraguay", value: "PY" },
      { display: "Peru", value: "PE" },
      { display: "Philippines", value: "PH" },
      { display: "Pitcairn", value: "PN" },
      { display: "Poland", value: "PL" },
      { display: "Portugal", value: "PT" },
      { display: "Puerto Rico", value: "PR" },
      { display: "Qatar", value: "QA" },
      { display: "Reunion", value: "RE" },
      { display: "Romania", value: "RO" },
      { display: "Russian Federation", value: "RU" },
      { display: "RWANDA", value: "RW" },
      { display: "Saint Helena", value: "SH" },
      { display: "Saint Kitts and Nevis", value: "KN" },
      { display: "Saint Lucia", value: "LC" },
      { display: "Saint Pierre and Miquelon", value: "PM" },
      { display: "Saint Vincent and the Grenadines", value: "VC" },
      { display: "Samoa", value: "WS" },
      { display: "San Marino", value: "SM" },
      { display: "Sao Tome and Principe", value: "ST" },
      { display: "Saudi Arabia", value: "SA" },
      { display: "Senegal", value: "SN" },
      { display: "Serbia and Montenegro", value: "CS" },
      { display: "Seychelles", value: "SC" },
      { display: "Sierra Leone", value: "SL" },
      { display: "Singapore", value: "SG" },
      { display: "Slovakia", value: "SK" },
      { display: "Slovenia", value: "SI" },
      { display: "Solomon Islands", value: "SB" },
      { display: "Somalia", value: "SO" },
      { display: "South Africa", value: "ZA" },
      { display: "South Georgia and the South Sandwich Islands", value: "GS" },
      { display: "Spain", value: "ES" },
      { display: "Sri Lanka", value: "LK" },
      { display: "Sudan", value: "SD" },
      { display: "Suridisplay", value: "SR" },
      { display: "Svalbard and Jan Mayen", value: "SJ" },
      { display: "Swaziland", value: "SZ" },
      { display: "Sweden", value: "SE" },
      { display: "Switzerland", value: "CH" },
      { display: "Syrian Arab Republic", value: "SY" },
      { display: "Taiwan, Province of China", value: "TW" },
      { display: "Tajikistan", value: "TJ" },
      { display: "Tanzania, United Republic of", value: "TZ" },
      { display: "Thailand", value: "TH" },
      { display: "Timor-Leste", value: "TL" },
      { display: "Togo", value: "TG" },
      { display: "Tokelau", value: "TK" },
      { display: "Tonga", value: "TO" },
      { display: "Trinidad and Tobago", value: "TT" },
      { display: "Tunisia", value: "TN" },
      { display: "Turkey", value: "TR" },
      { display: "Turkmenistan", value: "TM" },
      { display: "Turks and Caicos Islands", value: "TC" },
      { display: "Tuvalu", value: "TV" },
      { display: "Uganda", value: "UG" },
      { display: "Ukraine", value: "UA" },
      { display: "United Arab Emirates", value: "AE" },
      { display: "United Kingdom", value: "GB" },
      { display: "United States", value: "US" },
      { display: "United States Minor Outlying Islands", value: "UM" },
      { display: "Uruguay", value: "UY" },
      { display: "Uzbekistan", value: "UZ" },
      { display: "Vanuatu", value: "VU" },
      { display: "Venezuela", value: "VE" },
      { display: "Viet Nam", value: "VN" },
      { display: "Virgin Islands, British", value: "VG" },
      { display: "Virgin Islands, U.S.", value: "VI" },
      { display: "Wallis and Futuna", value: "WF" },
      { display: "Western Sahara", value: "EH" },
      { display: "Yemen", value: "YE" },
      { display: "Zambia", value: "ZM" },
      { display: "Zimbabwe", value: "ZW" }
    ];
  }
};

// src/app/shared/inmemory-db/chat-db.ts
var ChatDB = class {
  static {
    this.user = [
      {
        id: "7863a6802ez0e277a0f98534",
        name: "John Doe",
        avatar: "assets/images/faces/1.jpg",
        status: "online",
        chatInfo: [
          {
            chatId: "89564a680b3249760ea21fe77",
            contactId: "323sa680b3249760ea21rt47",
            contactName: "Frank Powell",
            unread: 4,
            lastChatTime: "2017-06-12T02:10:18.931Z"
          },
          {
            chatId: "3289564a680b2134760ea21fe7753",
            contactId: "14663a3406eb47ffa63d4fec9429cb71",
            contactName: "Betty Diaz",
            unread: 0,
            lastChatTime: "2017-06-12T02:10:18.931Z"
          }
        ]
      }
    ];
  }
  static {
    this.contacts = [
      {
        id: "323sa680b3249760ea21rt47",
        name: "Frank Powell",
        avatar: "assets/images/faces/13.jpg",
        status: "online",
        mood: ""
      },
      {
        id: "14663a3406eb47ffa63d4fec9429cb71",
        name: "Betty Diaz",
        avatar: "assets/images/faces/12.jpg",
        status: "online",
        mood: ""
      },
      {
        id: "43bd9bc59d164b5aea498e3ae1c24c3c",
        name: "Brian Stephens",
        avatar: "assets/images/faces/3.jpg",
        status: "online",
        mood: ""
      },
      {
        id: "3fc8e01f3ce649d1caf884fbf4f698e4",
        name: "Jacqueline Day",
        avatar: "assets/images/faces/16.jpg",
        status: "offline",
        mood: ""
      },
      {
        id: "e929b1d790ab49968ed8e34648553df4",
        name: "Arthur Mendoza",
        avatar: "assets/images/faces/10.jpg",
        status: "online",
        mood: ""
      },
      {
        id: "d6caf04bba614632b5fecf91aebf4564",
        name: "Jeremy Lee",
        avatar: "assets/images/faces/9.jpg",
        status: "offline",
        mood: ""
      },
      {
        id: "be0fb188c8e242f097fafa24632107e4",
        name: "Johnny Newman",
        avatar: "assets/images/faces/5.jpg",
        status: "offline",
        mood: ""
      },
      {
        id: "dea902191b964a68ba5f2d93cff37e13",
        name: "Jeffrey Little",
        avatar: "assets/images/faces/15.jpg",
        status: "online",
        mood: ""
      },
      {
        id: "0bf58f5ccc4543a9f8747350b7bda3c7",
        name: "Barbara Romero",
        avatar: "assets/images/faces/4.jpg",
        status: "offline",
        mood: ""
      },
      {
        id: "c5d7498bbcb84d81fc72168871ac6a6e",
        name: "Daniel James",
        avatar: "assets/images/faces/2.jpg",
        status: "offline",
        mood: ""
      },
      {
        id: "97bfbdd9413e46efdaca2010400fe18c",
        name: "Alice Sanders",
        avatar: "assets/images/faces/17.jpg",
        status: "offline",
        mood: ""
      }
    ];
  }
  static {
    this.chatCollection = [
      {
        id: "89564a680b3249760ea21fe77",
        chats: [
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Do you ever find yourself falling into the \u201Cdiscount trap?\u201D",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Giving away your knowledge or product just to gain clients?",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Yes",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Don\u2019t feel bad. It happens to a lot of us",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Do you ever find yourself falling into the \u201Cdiscount trap?\u201D",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Giving away your knowledge or product just to gain clients?",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "323sa680b3249760ea21rt47",
            text: "Yes",
            time: "2018-02-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Don\u2019t feel bad. It happens to a lot of us",
            time: "2018-02-32T08:45:28.291Z"
          }
        ]
      },
      {
        id: "3289564a680b2134760ea21fe7753",
        chats: [
          {
            contactId: "14663a3406eb47ffa63d4fec9429cb71",
            text: "Do you ever find yourself falling into the \u201Cdiscount trap?\u201D",
            time: "2018-03-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Giving away your knowledge or product just to gain clients?",
            time: "2018-03-32T08:45:28.291Z"
          },
          {
            contactId: "14663a3406eb47ffa63d4fec9429cb71",
            text: "Yes",
            time: "2018-03-32T08:45:28.291Z"
          },
          {
            contactId: "7863a6802ez0e277a0f98534",
            text: "Don\u2019t feel bad. It happens to a lot of us",
            time: "2018-03-32T08:45:28.291Z"
          }
        ]
      }
    ];
  }
};

// src/app/shared/inmemory-db/invoices.ts
var InvoiceDB = class {
  static {
    this.invoices = [
      {
        id: "5a9ae2106518248b68251fd1",
        orderNumber: "232",
        orderStatus: "Pending",
        orderDate: /* @__PURE__ */ new Date(),
        currency: "$",
        vat: 10,
        billFrom: {
          name: "Schoen, Conn and Mills",
          address: "rodriguez.trent@senger.com \n 61 Johnson St. Shirley, NY 11967. \n \n +202-555-0170"
        },
        billTo: {
          name: "UI Lib",
          address: "sales@ui-lib.com \n 8254 S. Garfield Street. Villa Rica, GA 30180. \n \n +1-202-555-0170"
        },
        items: [{
          name: "Item 1",
          unit: 9,
          unitPrice: 200
        }, {
          name: "Item 2",
          unit: 15,
          unitPrice: 300
        }]
      },
      {
        id: "5a9ae2106518248b68251fd2",
        orderNumber: "233",
        orderStatus: "Processing",
        orderDate: /* @__PURE__ */ new Date(),
        currency: "$",
        vat: 10,
        billFrom: {
          name: "New Age Inc.",
          address: "this is a test address \n 7664 Rockcrest Road. Longview, TX 75604. \n \n +1-202-555-0153"
        },
        billTo: {
          name: "UI Lib",
          address: "sales@ui-lib.com \n 8254 S. Garfield Street. Villa Rica, GA 30180. \n \n +1-202-555-0170"
        },
        items: [{
          name: "Item 1",
          unit: 3,
          unitPrice: 2e3
        }, {
          name: "Item 2",
          unit: 2,
          unitPrice: 4e3
        }]
      },
      {
        id: "5a9ae2106518248b68251fd3",
        orderNumber: "234",
        orderStatus: "Delivered",
        orderDate: /* @__PURE__ */ new Date(),
        currency: "$",
        vat: 10,
        billFrom: {
          name: "Predovic, Schowalter and Haag",
          address: "linwood53@price.com \n 7178 Plumb Branch Dr. South Bend, IN 46614 \n \n +999 9999 9999"
        },
        billTo: {
          name: "UI Lib",
          address: "sales@ui-lib.com \n 8254 S. Garfield Street. Villa Rica, GA 30180. \n \n +1-202-555-0170"
        },
        items: [{
          name: "Item 1",
          unit: 5,
          unitPrice: 1e3
        }, {
          name: "Item 2",
          unit: 2,
          unitPrice: 4e3
        }]
      },
      {
        id: "5a9ae2106518248b68251fd4",
        orderNumber: "235",
        orderStatus: "Delivered",
        orderDate: /* @__PURE__ */ new Date(),
        currency: "$",
        vat: 10,
        billFrom: {
          name: "Hane PLC",
          address: "nader.savanna@lindgren.org \n 858 8th St. Nanuet, NY 10954. \n \n +202-555-0131"
        },
        billTo: {
          name: "UI Lib",
          address: "sales@ui-lib.com \n 8254 S. Garfield Street. Villa Rica, GA 30180. \n \n +1-202-555-0170"
        },
        items: [{
          name: "Item 1",
          unit: 3,
          unitPrice: 4e3
        }, {
          name: "Item 2",
          unit: 1,
          unitPrice: 5e3
        }]
      }
    ];
  }
};

// src/app/shared/inmemory-db/users.ts
var UserDB = class {
  static {
    this.users = [
      {
        _id: "5a7b73f76bed15c94d1e46d4",
        index: 0,
        guid: "c01da2d1-07f8-4acc-a1e3-72dda7310af8",
        isActive: false,
        balance: 2838.08,
        age: 30,
        name: "Stefanie Marsh",
        gender: "female",
        company: "ACIUM",
        email: "stefaniemarsh@acium.com",
        phone: "+1 (857) 535-2066",
        address: "163 Poplar Avenue, Cliffside, Virginia, 4592",
        bd: "2015-02-08T04:28:44 -06:00",
        avatar: "assets/images/faces/1.jpg"
      },
      {
        _id: "5a7b73f7f79f4250b96a355a",
        index: 1,
        guid: "3f04aa40-62da-466d-ac14-2b8a5da3d1ce",
        isActive: true,
        balance: 3043.81,
        age: 39,
        name: "Elena Bennett",
        gender: "female",
        company: "FIBRODYNE",
        email: "elenabennett@fibrodyne.com",
        phone: "+1 (994) 570-2070",
        address: "526 Grace Court, Cherokee, Oregon, 7017",
        bd: "2017-11-15T09:04:57 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f78b64a02a67204d6e",
        index: 2,
        guid: "e7d9d61e-b657-4fcf-b069-2eb9bfdc44fa",
        isActive: true,
        balance: 1796.92,
        age: 23,
        name: "Joni Cabrera",
        gender: "female",
        company: "POWERNET",
        email: "jonicabrera@powernet.com",
        phone: "+1 (848) 410-2368",
        address: "554 Barlow Drive, Alamo, Michigan, 3686",
        bd: "2017-10-15T12:55:51 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f7572e59b231149b94",
        index: 3,
        guid: "47673d82-ab31-48a1-8a16-2c6701573c67",
        isActive: false,
        balance: 2850.27,
        age: 37,
        name: "Gallagher Shaw",
        gender: "male",
        company: "ZILLAR",
        email: "gallaghershaw@zillar.com",
        phone: "+1 (896) 422-3786",
        address: "111 Argyle Road, Graball, Idaho, 7272",
        bd: "2017-11-19T03:38:30 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f70f9d074552e13090",
        index: 4,
        guid: "bc9c7cd3-04e0-4095-a933-af28efaf3b3e",
        isActive: false,
        balance: 3743.48,
        age: 26,
        name: "Blanchard Knapp",
        gender: "male",
        company: "ACRODANCE",
        email: "blanchardknapp@acrodance.com",
        phone: "+1 (867) 542-2772",
        address: "707 Malta Street, Yukon, Wyoming, 6861",
        bd: "2014-05-28T01:33:58 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f78988bd6e92650473",
        index: 5,
        guid: "08cb947c-e49c-4736-9687-0fca0992ec38",
        isActive: false,
        balance: 3453.79,
        age: 34,
        name: "Parker Rivas",
        gender: "male",
        company: "SLAMBDA",
        email: "parkerrivas@slambda.com",
        phone: "+1 (997) 413-2418",
        address: "543 Roosevelt Place, Tibbie, Minnesota, 6944",
        bd: "2015-01-05T09:55:23 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f72488770f90649570",
        index: 6,
        guid: "771c85d5-7762-4bae-96fd-09892a9c4374",
        isActive: false,
        balance: 3334.73,
        age: 20,
        name: "Alexandria Forbes",
        gender: "female",
        company: "EQUITOX",
        email: "alexandriaforbes@equitox.com",
        phone: "+1 (869) 521-2533",
        address: "663 Minna Street, Omar, Alabama, 5265",
        bd: "2017-03-09T05:48:57 -06:00",
        avatar: "assets/images/faces/2.jpg"
      },
      {
        _id: "5a7b73f7c576e368b321a705",
        index: 7,
        guid: "2455a7ef-a537-46e1-a210-75e5e2187460",
        isActive: false,
        balance: 3488.64,
        age: 37,
        name: "Lessie Wise",
        gender: "female",
        company: "AFFLUEX",
        email: "lessiewise@affluex.com",
        phone: "+1 (820) 404-2967",
        address: "752 Woodhull Street, Utting, Oklahoma, 2739",
        bd: "2014-10-21T03:09:34 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f705f8a9c6e35c8ca2",
        index: 8,
        guid: "a90d65a8-681d-462f-bf08-eceeef366375",
        isActive: true,
        balance: 3786.67,
        age: 36,
        name: "Carrie Gates",
        gender: "female",
        company: "VIRVA",
        email: "carriegates@virva.com",
        phone: "+1 (845) 463-3986",
        address: "561 Boulevard Court, Rote, Louisiana, 8458",
        bd: "2017-03-30T02:06:23 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7a3e2be2dbb7b093e",
        index: 9,
        guid: "fb3d0f97-91ae-4336-b0b4-19f4a00fe567",
        isActive: false,
        balance: 3335.5,
        age: 33,
        name: "Dalton Spears",
        gender: "male",
        company: "MIRACLIS",
        email: "daltonspears@miraclis.com",
        phone: "+1 (919) 541-3528",
        address: "167 Lester Court, Glasgow, Arkansas, 6311",
        bd: "2017-04-01T01:41:12 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f716de69a9217c1273",
        index: 10,
        guid: "129a92fd-848f-48eb-98a1-aebf6e92b079",
        isActive: false,
        balance: 3811.15,
        age: 30,
        name: "Delia Merrill",
        gender: "female",
        company: "COMTEST",
        email: "deliamerrill@comtest.com",
        phone: "+1 (879) 401-2304",
        address: "761 Polhemus Place, Kidder, Puerto Rico, 5901",
        bd: "2014-08-29T08:42:59 -06:00",
        avatar: "assets/images/faces/9.jpg"
      },
      {
        _id: "5a7b73f7ed19007bed2d29fb",
        index: 11,
        guid: "d799b69a-192d-4ee3-9a69-9e8e5afc45b0",
        isActive: false,
        balance: 3935.82,
        age: 28,
        name: "Vance Aguilar",
        gender: "male",
        company: "CYCLONICA",
        email: "vanceaguilar@cyclonica.com",
        phone: "+1 (972) 549-2681",
        address: "653 Billings Place, Gardners, Connecticut, 7805",
        bd: "2015-02-21T03:06:14 -06:00",
        avatar: "assets/images/faces/1.jpg"
      },
      {
        _id: "5a7b73f78d0dc0858a70c44a",
        index: 12,
        guid: "8cbb37bb-7644-4993-b48b-df3a69deb339",
        isActive: true,
        balance: 3868.95,
        age: 28,
        name: "Adams Harper",
        gender: "male",
        company: "NORSUP",
        email: "adamsharper@norsup.com",
        phone: "+1 (824) 494-3395",
        address: "571 Turner Place, Norris, Mississippi, 3829",
        bd: "2014-01-30T02:05:53 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f7e929494a8568a885",
        index: 13,
        guid: "22ec32d7-0ba9-4366-b6d8-ca16389a2cd9",
        isActive: false,
        balance: 3954.41,
        age: 34,
        name: "Bass Sexton",
        gender: "male",
        company: "CIRCUM",
        email: "basssexton@circum.com",
        phone: "+1 (930) 476-3634",
        address: "563 Victor Road, Richmond, Kansas, 7742",
        bd: "2014-05-04T10:16:32 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f767e97ce3136444fd",
        index: 14,
        guid: "031d282f-0be9-49e1-a211-9aa59d449d91",
        isActive: false,
        balance: 3287.33,
        age: 24,
        name: "Howard Velez",
        gender: "male",
        company: "ECOSYS",
        email: "howardvelez@ecosys.com",
        phone: "+1 (920) 556-2885",
        address: "378 Grimes Road, Websterville, Marshall Islands, 3506",
        bd: "2015-12-19T08:17:58 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f7fba076653cc18925",
        index: 15,
        guid: "d76ab6d6-d1db-4286-8516-ce6c9db3972a",
        isActive: false,
        balance: 3279.98,
        age: 21,
        name: "Lola Morton",
        gender: "female",
        company: "PROVIDCO",
        email: "lolamorton@providco.com",
        phone: "+1 (963) 458-2788",
        address: "991 Ashland Place, Richville, New York, 3529",
        bd: "2016-11-29T07:58:24 -06:00",
        avatar: "assets/images/faces/2.jpg"
      },
      {
        _id: "5a7b73f7c6d408bc853be87c",
        index: 16,
        guid: "30c2d1c7-770b-4adb-b6df-cc205d748323",
        isActive: false,
        balance: 3955.55,
        age: 37,
        name: "Bishop Rutledge",
        gender: "male",
        company: "DAYCORE",
        email: "bishoprutledge@daycore.com",
        phone: "+1 (886) 539-3156",
        address: "870 Vanderveer Place, Bridgetown, California, 7593",
        bd: "2014-11-10T04:47:00 -06:00",
        avatar: "assets/images/faces/2.jpg"
      },
      {
        _id: "5a7b73f7abe6c78719d2f494",
        index: 17,
        guid: "2d8e77a1-4a88-4642-b6a8-693de296661c",
        isActive: true,
        balance: 1832.83,
        age: 23,
        name: "Lea Reese",
        gender: "female",
        company: "GLUID",
        email: "leareese@gluid.com",
        phone: "+1 (866) 413-2199",
        address: "811 Dunne Place, Vowinckel, Rhode Island, 8646",
        bd: "2014-03-16T04:30:06 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f72d64af126b8080be",
        index: 18,
        guid: "e1e8ee63-6d08-48fc-a077-2265cee34f23",
        isActive: true,
        balance: 2419.18,
        age: 23,
        name: "Knox Moses",
        gender: "male",
        company: "BRAINCLIP",
        email: "knoxmoses@brainclip.com",
        phone: "+1 (982) 519-2486",
        address: "917 Turnbull Avenue, Shasta, Virgin Islands, 7016",
        bd: "2015-11-09T10:11:15 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f789b4e9086d34b255",
        index: 19,
        guid: "13552b7d-928c-4b92-a2ae-5ccbee807594",
        isActive: false,
        balance: 1220.91,
        age: 22,
        name: "Marsha Jacobs",
        gender: "female",
        company: "COMSTAR",
        email: "marshajacobs@comstar.com",
        phone: "+1 (858) 511-2546",
        address: "580 Hampton Avenue, Ilchester, New Hampshire, 2191",
        bd: "2016-02-11T01:34:23 -06:00",
        avatar: "assets/images/faces/7.jpg"
      },
      {
        _id: "5a7b73f737eea8e94089b7b4",
        index: 20,
        guid: "cf577c87-b40c-4c09-9fac-d04c9a824b86",
        isActive: false,
        balance: 2446.07,
        age: 25,
        name: "Bell Emerson",
        gender: "male",
        company: "MULTIFLEX",
        email: "bellemerson@multiflex.com",
        phone: "+1 (806) 496-2473",
        address: "238 Oxford Walk, Monument, New Mexico, 1345",
        bd: "2016-10-07T01:07:21 -06:00",
        avatar: "assets/images/faces/2.jpg"
      },
      {
        _id: "5a7b73f76bc821dc6ee56ee2",
        index: 21,
        guid: "b6c685c2-a497-4261-9217-622723d5235f",
        isActive: false,
        balance: 3694.63,
        age: 33,
        name: "Cecelia Graham",
        gender: "female",
        company: "ZOXY",
        email: "ceceliagraham@zoxy.com",
        phone: "+1 (933) 429-3129",
        address: "954 Lawton Street, Terlingua, New Jersey, 6723",
        bd: "2017-12-01T04:36:13 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f794c27c4048290cbf",
        index: 22,
        guid: "7e887403-8ff5-41b4-9902-bb63ff714fee",
        isActive: true,
        balance: 2804.02,
        age: 29,
        name: "Anthony Pennington",
        gender: "male",
        company: "NAMEGEN",
        email: "anthonypennington@namegen.com",
        phone: "+1 (860) 458-3988",
        address: "287 Auburn Place, Gardiner, Northern Mariana Islands, 7131",
        bd: "2018-02-04T11:06:51 -06:00",
        avatar: "assets/images/faces/7.jpg"
      },
      {
        _id: "5a7b73f720a5781f7d19597a",
        index: 23,
        guid: "9e108687-e1ca-4385-bdd5-62ab006f8aa3",
        isActive: true,
        balance: 1984.1,
        age: 36,
        name: "Mayo Justice",
        gender: "male",
        company: "SLOFAST",
        email: "mayojustice@slofast.com",
        phone: "+1 (854) 428-2270",
        address: "648 Melba Court, Dodge, Pennsylvania, 7596",
        bd: "2016-12-29T07:28:10 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7f0a4c5e6c9807fb2",
        index: 24,
        guid: "93b0b383-dd69-4453-be26-f13ae361ce67",
        isActive: true,
        balance: 1845.13,
        age: 22,
        name: "Vaughn Salazar",
        gender: "male",
        company: "ZAGGLE",
        email: "vaughnsalazar@zaggle.com",
        phone: "+1 (986) 415-3294",
        address: "382 Dewitt Avenue, Goodville, Palau, 711",
        bd: "2014-10-31T12:32:59 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f7e6c45298c709371c",
        index: 25,
        guid: "5a059bbb-3f6d-47bc-ba2b-c13eeaaa93b4",
        isActive: false,
        balance: 3684.79,
        age: 31,
        name: "Calhoun Bradshaw",
        gender: "male",
        company: "OVERPLEX",
        email: "calhounbradshaw@overplex.com",
        phone: "+1 (964) 594-2363",
        address: "527 Seton Place, Wedgewood, Wisconsin, 8306",
        bd: "2016-05-27T10:46:17 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f79468759d25ecdcf4",
        index: 26,
        guid: "68d7f78e-5001-480b-a67d-72b370a5c2de",
        isActive: false,
        balance: 1831.14,
        age: 29,
        name: "Dianne Bauer",
        gender: "female",
        company: "XUMONK",
        email: "diannebauer@xumonk.com",
        phone: "+1 (866) 510-2479",
        address: "540 Moffat Street, Emison, South Carolina, 7329",
        bd: "2014-09-02T04:57:23 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f7346b1bbab11524fa",
        index: 27,
        guid: "0729eef8-36c5-4aa2-8e31-f5e2ca19b94b",
        isActive: false,
        balance: 1719.77,
        age: 22,
        name: "Hebert Bryan",
        gender: "male",
        company: "COMTRAIL",
        email: "hebertbryan@comtrail.com",
        phone: "+1 (838) 579-3709",
        address: "669 Hausman Street, Gerber, Kentucky, 7779",
        bd: "2017-11-29T12:22:59 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f75116874002de08de",
        index: 28,
        guid: "63014b40-3f1e-40ff-b2f7-f55ef6a5a599",
        isActive: true,
        balance: 1973.27,
        age: 20,
        name: "Cash Bean",
        gender: "male",
        company: "SUPREMIA",
        email: "cashbean@supremia.com",
        phone: "+1 (846) 551-2291",
        address: "152 Garnet Street, Boling, Nevada, 4867",
        bd: "2014-01-06T10:18:37 -06:00",
        avatar: "assets/images/faces/7.jpg"
      },
      {
        _id: "5a7b73f739be4dc1f743993c",
        index: 29,
        guid: "ae498760-b43b-4c9c-8575-820f419984f6",
        isActive: true,
        balance: 2118.14,
        age: 36,
        name: "Candy Hopper",
        gender: "female",
        company: "ACCUFARM",
        email: "candyhopper@accufarm.com",
        phone: "+1 (841) 425-2442",
        address: "695 Nassau Avenue, Nutrioso, Maryland, 2026",
        bd: "2016-01-03T02:15:56 -06:00",
        avatar: "assets/images/faces/9.jpg"
      },
      {
        _id: "5a7b73f70b86f2969d762be2",
        index: 30,
        guid: "f19cb86e-ab4f-4d07-833a-4adb8a19d0af",
        isActive: false,
        balance: 3794.89,
        age: 37,
        name: "Fisher Powell",
        gender: "male",
        company: "ENOMEN",
        email: "fisherpowell@enomen.com",
        phone: "+1 (876) 562-2932",
        address: "616 Tapscott Avenue, Crucible, Nebraska, 4900",
        bd: "2018-01-31T05:15:13 -06:00",
        avatar: "assets/images/faces/1.jpg"
      },
      {
        _id: "5a7b73f7394648a68c2a6ae3",
        index: 31,
        guid: "a88e5389-0b07-4d19-ac6c-718ce9e0de55",
        isActive: false,
        balance: 3343.45,
        age: 38,
        name: "Rosemary Sloan",
        gender: "female",
        company: "PHORMULA",
        email: "rosemarysloan@phormula.com",
        phone: "+1 (924) 517-3289",
        address: "687 Navy Walk, Edmund, Delaware, 1419",
        bd: "2018-01-23T11:32:25 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f77ad97f4e1c2fa65a",
        index: 32,
        guid: "fb915568-2875-49b3-96d7-6b54b2b186a1",
        isActive: true,
        balance: 2680.62,
        age: 30,
        name: "Elba Glover",
        gender: "female",
        company: "APPLICA",
        email: "elbaglover@applica.com",
        phone: "+1 (857) 495-3565",
        address: "279 Bridgewater Street, Edneyville, Utah, 9246",
        bd: "2015-10-03T12:24:56 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f72598106a97fbf7d5",
        index: 33,
        guid: "fac3cd4b-2d42-4b4f-9d6f-0bac689bd47b",
        isActive: false,
        balance: 3286.46,
        age: 37,
        name: "Mildred Short",
        gender: "female",
        company: "NIXELT",
        email: "mildredshort@nixelt.com",
        phone: "+1 (980) 530-3588",
        address: "434 Elm Place, Coloma, West Virginia, 1990",
        bd: "2016-03-22T10:13:26 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f7b88290b05f53faa1",
        index: 34,
        guid: "b1c6a3a3-00bd-4bc6-87df-69eecd909ab5",
        isActive: false,
        balance: 1484.16,
        age: 24,
        name: "Karin Schultz",
        gender: "female",
        company: "PLASMOS",
        email: "karinschultz@plasmos.com",
        phone: "+1 (904) 544-2796",
        address: "380 Rockaway Avenue, Faxon, American Samoa, 5776",
        bd: "2016-03-27T09:30:36 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7d2f7429d0caec5fe",
        index: 35,
        guid: "62c961ac-49b1-4a69-b4bf-13a396ec4fd9",
        isActive: false,
        balance: 3450.17,
        age: 23,
        name: "Addie Rose",
        gender: "female",
        company: "XYQAG",
        email: "addierose@xyqag.com",
        phone: "+1 (838) 549-3147",
        address: "999 Coleridge Street, Golconda, Vermont, 9575",
        bd: "2016-10-01T06:50:42 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f78a4c54ff8334e053",
        index: 36,
        guid: "4f2f7ae5-0bd1-4665-b97f-c556e5162349",
        isActive: false,
        balance: 1797.89,
        age: 23,
        name: "Janie Ellison",
        gender: "female",
        company: "SPLINX",
        email: "janieellison@splinx.com",
        phone: "+1 (947) 460-2254",
        address: "114 Landis Court, Genoa, Indiana, 5198",
        bd: "2017-07-28T12:45:44 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f7c87f7e86fcb00055",
        index: 37,
        guid: "b7236378-8129-44b5-bcc6-0369290ffad6",
        isActive: false,
        balance: 3776.51,
        age: 38,
        name: "Elisabeth Campbell",
        gender: "female",
        company: "GOKO",
        email: "elisabethcampbell@goko.com",
        phone: "+1 (849) 430-3377",
        address: "832 Kermit Place, Lutsen, Georgia, 9145",
        bd: "2015-04-26T06:40:08 -06:00",
        avatar: "assets/images/faces/2.jpg"
      },
      {
        _id: "5a7b73f712f9208f145fa6ea",
        index: 38,
        guid: "5c955e3a-5f3a-4ead-96ee-80a5de6dc479",
        isActive: true,
        balance: 3794.93,
        age: 27,
        name: "Noble Holland",
        gender: "male",
        company: "NUTRALAB",
        email: "nobleholland@nutralab.com",
        phone: "+1 (888) 573-3730",
        address: "408 Roosevelt Court, Hiwasse, North Dakota, 281",
        bd: "2014-03-25T12:24:34 -06:00",
        avatar: "assets/images/faces/7.jpg"
      },
      {
        _id: "5a7b73f7aa1f371de59df90b",
        index: 39,
        guid: "94698a81-61a6-4e23-a952-76a50fba71ef",
        isActive: true,
        balance: 2205.55,
        age: 35,
        name: "Laverne Brock",
        gender: "female",
        company: "ICOLOGY",
        email: "lavernebrock@icology.com",
        phone: "+1 (821) 600-3174",
        address: "391 Conover Street, Cassel, Tennessee, 6566",
        bd: "2016-01-27T09:40:41 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f7c45c697931199945",
        index: 40,
        guid: "a05a215f-be1c-49d1-89ca-c821b118f923",
        isActive: true,
        balance: 2397.12,
        age: 29,
        name: "Irene Frost",
        gender: "female",
        company: "RODEMCO",
        email: "irenefrost@rodemco.com",
        phone: "+1 (918) 539-2612",
        address: "401 Moore Place, Groton, Arizona, 3415",
        bd: "2017-09-14T09:46:55 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7ef55416e92ebc818",
        index: 41,
        guid: "1ae8ceac-e8d0-4417-9f6f-04cd4e4738ad",
        isActive: false,
        balance: 3335.51,
        age: 35,
        name: "Beard Hendricks",
        gender: "male",
        company: "QUONK",
        email: "beardhendricks@quonk.com",
        phone: "+1 (847) 521-3952",
        address: "576 Bayard Street, Chloride, Federated States Of Micronesia, 8070",
        bd: "2016-11-01T12:47:26 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f7cbeecfe6febd672d",
        index: 42,
        guid: "afdf3298-77bd-46b3-ae8d-232f815c5f01",
        isActive: false,
        balance: 2205.01,
        age: 37,
        name: "Nelson Shields",
        gender: "male",
        company: "ARTWORLDS",
        email: "nelsonshields@artworlds.com",
        phone: "+1 (956) 534-3050",
        address: "581 Maple Street, Needmore, Colorado, 2062",
        bd: "2014-07-21T08:22:01 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f71803de25c5f754ad",
        index: 43,
        guid: "5b872cad-4388-496b-8ede-5f86990dec00",
        isActive: true,
        balance: 1001.05,
        age: 21,
        name: "Luella Duffy",
        gender: "female",
        company: "KROG",
        email: "luelladuffy@krog.com",
        phone: "+1 (973) 451-2222",
        address: "349 Bryant Street, Tioga, South Dakota, 6493",
        bd: "2016-04-27T02:46:46 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f77f2a05eacb331c74",
        index: 44,
        guid: "7d6b7650-10d7-435d-87ca-33a1fe12cd57",
        isActive: false,
        balance: 1926.79,
        age: 27,
        name: "Rosa Guthrie",
        gender: "female",
        company: "COMTOURS",
        email: "rosaguthrie@comtours.com",
        phone: "+1 (814) 528-2701",
        address: "719 Kathleen Court, Morriston, Guam, 4011",
        bd: "2015-07-02T08:22:18 -06:00",
        avatar: "assets/images/faces/9.jpg"
      },
      {
        _id: "5a7b73f7727afbb0fc15653b",
        index: 45,
        guid: "ebbc985b-227e-4954-a8a6-588b2a2bff22",
        isActive: false,
        balance: 2464.9,
        age: 29,
        name: "Dillard Carlson",
        gender: "male",
        company: "COMCUR",
        email: "dillardcarlson@comcur.com",
        phone: "+1 (847) 469-3741",
        address: "918 Oceanic Avenue, Cochranville, Missouri, 1018",
        bd: "2016-06-11T11:31:54 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f71dd7612e967e01ae",
        index: 46,
        guid: "63a2ee7f-2141-4ec5-b1e2-fcdcd62f28ed",
        isActive: false,
        balance: 3917.74,
        age: 25,
        name: "Faye Walls",
        gender: "female",
        company: "EMERGENT",
        email: "fayewalls@emergent.com",
        phone: "+1 (964) 527-3791",
        address: "947 Judge Street, Nescatunga, Maine, 4928",
        bd: "2014-06-23T12:46:21 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7b33c73c425db7ee0",
        index: 47,
        guid: "61d40a89-af0c-40ca-8970-c54978134e6b",
        isActive: true,
        balance: 2213.18,
        age: 32,
        name: "Norma Hooper",
        gender: "female",
        company: "PARCOE",
        email: "normahooper@parcoe.com",
        phone: "+1 (827) 503-2742",
        address: "470 Fenimore Street, Hatteras, Texas, 1582",
        bd: "2015-01-15T12:22:00 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f7c30aa4064670cf21",
        index: 48,
        guid: "969d77af-b251-4924-82cf-7c787752161d",
        isActive: false,
        balance: 3673.94,
        age: 23,
        name: "Lee Wiggins",
        gender: "female",
        company: "NITRACYR",
        email: "leewiggins@nitracyr.com",
        phone: "+1 (941) 478-3536",
        address: "958 Flatbush Avenue, Clara, North Carolina, 970",
        bd: "2018-01-09T11:09:34 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7ecd5a4859f2d94dc",
        index: 49,
        guid: "cdf9b8de-a309-4cb7-80bb-f1b830b8b640",
        isActive: true,
        balance: 2166.21,
        age: 27,
        name: "Alvarez Lynch",
        gender: "male",
        company: "KIGGLE",
        email: "alvarezlynch@kiggle.com",
        phone: "+1 (929) 528-3805",
        address: "901 Stratford Road, Derwood, Iowa, 1402",
        bd: "2015-01-08T04:28:57 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f7216c8cabc849eea7",
        index: 50,
        guid: "c4175d6a-1560-468e-b682-701c1549b6b1",
        isActive: false,
        balance: 3479.39,
        age: 39,
        name: "Oneal Rosario",
        gender: "male",
        company: "UBERLUX",
        email: "onealrosario@uberlux.com",
        phone: "+1 (951) 572-3027",
        address: "267 Rockaway Parkway, Chapin, Montana, 7813",
        bd: "2014-02-10T05:08:13 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f78841719bf955b2d9",
        index: 51,
        guid: "966c9ce6-9151-47cb-8c71-98c4cd0d2f40",
        isActive: false,
        balance: 1625.49,
        age: 36,
        name: "Olsen Stevens",
        gender: "male",
        company: "EMPIRICA",
        email: "olsenstevens@empirica.com",
        phone: "+1 (871) 403-3377",
        address: "704 Lamont Court, Saranap, Massachusetts, 3171",
        bd: "2014-09-17T05:13:13 -06:00",
        avatar: "assets/images/faces/8.jpg"
      },
      {
        _id: "5a7b73f7b7b8e578dff0f85c",
        index: 52,
        guid: "8269a34f-3a02-47d6-bcb1-8f076bb478f0",
        isActive: true,
        balance: 1143.73,
        age: 27,
        name: "Marian Henson",
        gender: "female",
        company: "ENDIPINE",
        email: "marianhenson@endipine.com",
        phone: "+1 (995) 406-2592",
        address: "803 Ellery Street, Boykin, Alaska, 8624",
        bd: "2016-08-28T01:22:51 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f737459ec79c91ca75",
        index: 53,
        guid: "badb9342-10fd-4520-ae66-c246e47add8f",
        isActive: false,
        balance: 1458.01,
        age: 23,
        name: "Dudley Dickson",
        gender: "male",
        company: "POLARIA",
        email: "dudleydickson@polaria.com",
        phone: "+1 (860) 428-3250",
        address: "833 Revere Place, Rockbridge, Illinois, 4628",
        bd: "2017-01-19T12:36:59 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f70ddc6fc11ebf043a",
        index: 54,
        guid: "52b1be89-8186-4685-81b7-203c17ed9f89",
        isActive: true,
        balance: 2815.76,
        age: 25,
        name: "Earnestine Oneil",
        gender: "female",
        company: "CYTREK",
        email: "earnestineoneil@cytrek.com",
        phone: "+1 (879) 541-3490",
        address: "442 Emerald Street, Graniteville, Hawaii, 1302",
        bd: "2017-07-07T10:34:33 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f78b816185ccd2b4b3",
        index: 55,
        guid: "e66850ea-546b-4eb5-ae76-d66b0e727f44",
        isActive: true,
        balance: 3645.09,
        age: 21,
        name: "Nicholson Mason",
        gender: "male",
        company: "TELEQUIET",
        email: "nicholsonmason@telequiet.com",
        phone: "+1 (861) 528-3215",
        address: "261 Aitken Place, Cecilia, Ohio, 1381",
        bd: "2016-03-20T08:31:34 -06:00",
        avatar: "assets/images/faces/10.jpg"
      },
      {
        _id: "5a7b73f780f8bf8fbe24d75c",
        index: 56,
        guid: "40b999cd-00bf-46e0-9107-b44906d832e0",
        isActive: false,
        balance: 2477.66,
        age: 36,
        name: "Linda Shaffer",
        gender: "female",
        company: "ZORK",
        email: "lindashaffer@zork.com",
        phone: "+1 (828) 524-3011",
        address: "350 Plymouth Street, Waterford, Washington, 6715",
        bd: "2017-07-09T05:51:11 -06:00",
        avatar: "assets/images/faces/4.jpg"
      },
      {
        _id: "5a7b73f741e22fc19ffa6952",
        index: 57,
        guid: "cc2ac19d-7d67-4f60-973a-369160a9c377",
        isActive: false,
        balance: 2651.39,
        age: 20,
        name: "Montoya Riggs",
        gender: "male",
        company: "MARKETOID",
        email: "montoyariggs@marketoid.com",
        phone: "+1 (809) 562-3786",
        address: "633 Monitor Street, Chicopee, District Of Columbia, 550",
        bd: "2016-02-05T12:36:05 -06:00",
        avatar: "assets/images/faces/9.jpg"
      },
      {
        _id: "5a7b73f7de56ead40c26e69a",
        index: 58,
        guid: "6e0b06b8-1199-498c-8002-41f4972aa2d2",
        isActive: false,
        balance: 3463.92,
        age: 28,
        name: "Walker Duran",
        gender: "male",
        company: "GEOFORM",
        email: "walkerduran@geoform.com",
        phone: "+1 (868) 502-2553",
        address: "550 Kensington Walk, Wyano, Virginia, 7703",
        bd: "2017-08-18T12:39:37 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f70a04fe142269ea8d",
        index: 59,
        guid: "c6733cd5-1e73-4317-b4bc-1a9e597581a4",
        isActive: true,
        balance: 3846.35,
        age: 26,
        name: "Suzanne House",
        gender: "female",
        company: "SYBIXTEX",
        email: "suzannehouse@sybixtex.com",
        phone: "+1 (892) 533-2739",
        address: "367 Harwood Place, Twilight, Oregon, 9799",
        bd: "2016-11-26T11:57:18 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f7339943d94af3b39d",
        index: 60,
        guid: "4ff2c2aa-0573-4be1-a1c8-f684af8a5fbf",
        isActive: false,
        balance: 2717.94,
        age: 26,
        name: "Lewis Oconnor",
        gender: "male",
        company: "EXOZENT",
        email: "lewisoconnor@exozent.com",
        phone: "+1 (954) 582-2660",
        address: "717 Sutter Avenue, Bartley, Michigan, 1142",
        bd: "2017-08-21T08:25:00 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f7d8e266ad1bc5daa8",
        index: 61,
        guid: "94667aad-86fc-4a2c-94fb-11b572307c75",
        isActive: false,
        balance: 2725.58,
        age: 39,
        name: "Shelley Bonner",
        gender: "female",
        company: "INDEXIA",
        email: "shelleybonner@indexia.com",
        phone: "+1 (965) 490-3768",
        address: "896 Clinton Avenue, Canoochee, Idaho, 1154",
        bd: "2016-04-11T06:08:29 -06:00",
        avatar: "assets/images/faces/6.jpg"
      },
      {
        _id: "5a7b73f7e74a5af674e4cbdd",
        index: 62,
        guid: "ec68c47e-7cbd-485e-8d54-fab1bb6ea008",
        isActive: true,
        balance: 1343.87,
        age: 29,
        name: "Mccall Morales",
        gender: "male",
        company: "QUILITY",
        email: "mccallmorales@quility.com",
        phone: "+1 (939) 455-2610",
        address: "325 Crystal Street, Harleigh, Wyoming, 5658",
        bd: "2014-11-20T07:30:04 -06:00",
        avatar: "assets/images/faces/3.jpg"
      },
      {
        _id: "5a7b73f7efb231e53a0c94cd",
        index: 63,
        guid: "6a8b3f55-406c-4ae8-be59-94a0f8fbd180",
        isActive: false,
        balance: 1092.69,
        age: 37,
        name: "Vera Mcpherson",
        gender: "female",
        company: "CIPROMOX",
        email: "veramcpherson@cipromox.com",
        phone: "+1 (890) 500-3729",
        address: "771 Beard Street, Rivera, Minnesota, 4726",
        bd: "2017-07-13T02:47:50 -06:00",
        avatar: "assets/images/faces/2.jpg"
      },
      {
        _id: "5a7b73f7e345c5dfc5d636e4",
        index: 64,
        guid: "46879caf-76e6-46e0-9b8b-bc17667a81ea",
        isActive: true,
        balance: 2077.12,
        age: 36,
        name: "Gregory Roth",
        gender: "male",
        company: "EARWAX",
        email: "gregoryroth@earwax.com",
        phone: "+1 (806) 595-2477",
        address: "349 Dunham Place, Sardis, Alabama, 3320",
        bd: "2017-11-08T02:26:23 -06:00",
        avatar: "assets/images/faces/5.jpg"
      },
      {
        _id: "5a7b73f77f5f9d730fab11e0",
        index: 65,
        guid: "9cfb8f58-7acf-4a39-bf2b-c90269c33db0",
        isActive: true,
        balance: 3503.58,
        age: 31,
        name: "Russell Carver",
        gender: "male",
        company: "PREMIANT",
        email: "russellcarver@premiant.com",
        phone: "+1 (849) 521-2335",
        address: "851 Noble Street, Holcombe, Oklahoma, 311",
        bd: "2016-07-10T10:08:35 -06:00",
        avatar: "assets/images/faces/1.jpg"
      },
      {
        _id: "5a7b73f7cab10f461153989c",
        index: 66,
        guid: "2562a818-4451-4193-94cd-650d131ff097",
        isActive: false,
        balance: 1652.9,
        age: 21,
        name: "Darlene Hurley",
        gender: "female",
        company: "STELAECOR",
        email: "darlenehurley@stelaecor.com",
        phone: "+1 (868) 492-2270",
        address: "627 Wilson Street, Loveland, Louisiana, 765",
        bd: "2017-05-20T12:39:31 -06:00",
        avatar: "assets/images/faces/9.jpg"
      },
      {
        _id: "5a7b73f7ecccc997e4160a59",
        index: 67,
        guid: "0050170f-0283-481d-9633-dc9d134be121",
        isActive: true,
        balance: 3692.88,
        age: 21,
        name: "Lela Bailey",
        gender: "female",
        company: "AQUOAVO",
        email: "lelabailey@aquoavo.com",
        phone: "+1 (917) 449-2329",
        address: "121 Adams Street, Malo, Arkansas, 7435",
        bd: "2016-11-06T04:55:46 -06:00",
        avatar: "assets/images/faces/5.jpg"
      }
    ];
  }
};

// src/app/shared/inmemory-db/inmemory-db.service.ts
var InMemoryDataService = class {
  createDb() {
    return {
      "products": ProductDB.products,
      "invoices": InvoiceDB.invoices,
      "mails": MailDB.messages,
      "countries": CountryDB.countries,
      "contacts": ChatDB.contacts,
      "chat-collections": ChatDB.chatCollection,
      "chat-user": ChatDB.user,
      "users": UserDB.users
    };
  }
};

// node_modules/@angular/service-worker/fesm2022/service-worker.mjs
var ERR_SW_NOT_SUPPORTED = "Service workers are disabled or not supported by this browser";
var NgswCommChannel = class {
  serviceWorker;
  worker;
  registration;
  events;
  constructor(serviceWorker, injector) {
    this.serviceWorker = serviceWorker;
    if (!serviceWorker) {
      this.worker = this.events = this.registration = new Observable((subscriber) => subscriber.error(new RuntimeError(5601, (typeof ngDevMode === "undefined" || ngDevMode) && ERR_SW_NOT_SUPPORTED)));
    } else {
      let currentWorker = null;
      const workerSubject = new Subject();
      this.worker = new Observable((subscriber) => {
        if (currentWorker !== null) {
          subscriber.next(currentWorker);
        }
        return workerSubject.subscribe((v) => subscriber.next(v));
      });
      const updateController = () => {
        const {
          controller
        } = serviceWorker;
        if (controller === null) {
          return;
        }
        currentWorker = controller;
        workerSubject.next(currentWorker);
      };
      serviceWorker.addEventListener("controllerchange", updateController);
      updateController();
      this.registration = this.worker.pipe(switchMap(() => serviceWorker.getRegistration()));
      const _events = new Subject();
      this.events = _events.asObservable();
      const messageListener = (event) => {
        const {
          data
        } = event;
        if (data?.type) {
          _events.next(data);
        }
      };
      serviceWorker.addEventListener("message", messageListener);
      const appRef = injector?.get(ApplicationRef, null, {
        optional: true
      });
      appRef?.onDestroy(() => {
        serviceWorker.removeEventListener("controllerchange", updateController);
        serviceWorker.removeEventListener("message", messageListener);
      });
    }
  }
  postMessage(action, payload) {
    return new Promise((resolve) => {
      this.worker.pipe(take(1)).subscribe((sw) => {
        sw.postMessage(__spreadValues({
          action
        }, payload));
        resolve();
      });
    });
  }
  postMessageWithOperation(type, payload, operationNonce) {
    const waitForOperationCompleted = this.waitForOperationCompleted(operationNonce);
    const postMessage = this.postMessage(type, payload);
    return Promise.all([postMessage, waitForOperationCompleted]).then(([, result]) => result);
  }
  generateNonce() {
    return Math.round(Math.random() * 1e7);
  }
  eventsOfType(type) {
    let filterFn;
    if (typeof type === "string") {
      filterFn = (event) => event.type === type;
    } else {
      filterFn = (event) => type.includes(event.type);
    }
    return this.events.pipe(filter(filterFn));
  }
  nextEventOfType(type) {
    return this.eventsOfType(type).pipe(take(1));
  }
  waitForOperationCompleted(nonce) {
    return new Promise((resolve, reject) => {
      this.eventsOfType("OPERATION_COMPLETED").pipe(filter((event) => event.nonce === nonce), take(1), map((event) => {
        if (event.result !== void 0) {
          return event.result;
        }
        throw new Error(event.error);
      })).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  get isEnabled() {
    return !!this.serviceWorker;
  }
};
var SwPush = class _SwPush {
  sw;
  /**
   * Emits the payloads of the received push notification messages.
   */
  messages;
  /**
   * Emits the payloads of the received push notification messages as well as the action the user
   * interacted with. If no action was used the `action` property contains an empty string `''`.
   *
   * Note that the `notification` property does **not** contain a
   * [Notification][Mozilla Notification] object but rather a
   * [NotificationOptions](https://notifications.spec.whatwg.org/#dictdef-notificationoptions)
   * object that also includes the `title` of the [Notification][Mozilla Notification] object.
   *
   * [Mozilla Notification]: https://developer.mozilla.org/en-US/docs/Web/API/Notification
   */
  notificationClicks;
  /**
   * Emits the currently active
   * [PushSubscription](https://developer.mozilla.org/en-US/docs/Web/API/PushSubscription)
   * associated to the Service Worker registration or `null` if there is no subscription.
   */
  subscription;
  /**
   * True if the Service Worker is enabled (supported by the browser and enabled via
   * `ServiceWorkerModule`).
   */
  get isEnabled() {
    return this.sw.isEnabled;
  }
  pushManager = null;
  subscriptionChanges = new Subject();
  constructor(sw) {
    this.sw = sw;
    if (!sw.isEnabled) {
      this.messages = NEVER;
      this.notificationClicks = NEVER;
      this.subscription = NEVER;
      return;
    }
    this.messages = this.sw.eventsOfType("PUSH").pipe(map((message) => message.data));
    this.notificationClicks = this.sw.eventsOfType("NOTIFICATION_CLICK").pipe(map((message) => message.data));
    this.pushManager = this.sw.registration.pipe(map((registration) => registration.pushManager));
    const workerDrivenSubscriptions = this.pushManager.pipe(switchMap((pm) => pm.getSubscription()));
    this.subscription = new Observable((subscriber) => {
      const workerDrivenSubscription = workerDrivenSubscriptions.subscribe(subscriber);
      const subscriptionChanges = this.subscriptionChanges.subscribe(subscriber);
      return () => {
        workerDrivenSubscription.unsubscribe();
        subscriptionChanges.unsubscribe();
      };
    });
  }
  /**
   * Subscribes to Web Push Notifications,
   * after requesting and receiving user permission.
   *
   * @param options An object containing the `serverPublicKey` string.
   * @returns A Promise that resolves to the new subscription object.
   */
  requestSubscription(options) {
    if (!this.sw.isEnabled || this.pushManager === null) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const pushOptions = {
      userVisibleOnly: true
    };
    let key = this.decodeBase64(options.serverPublicKey.replace(/_/g, "/").replace(/-/g, "+"));
    let applicationServerKey = new Uint8Array(new ArrayBuffer(key.length));
    for (let i = 0; i < key.length; i++) {
      applicationServerKey[i] = key.charCodeAt(i);
    }
    pushOptions.applicationServerKey = applicationServerKey;
    return new Promise((resolve, reject) => {
      this.pushManager.pipe(switchMap((pm) => pm.subscribe(pushOptions)), take(1)).subscribe({
        next: (sub) => {
          this.subscriptionChanges.next(sub);
          resolve(sub);
        },
        error: reject
      });
    });
  }
  /**
   * Unsubscribes from Service Worker push notifications.
   *
   * @returns A Promise that is resolved when the operation succeeds, or is rejected if there is no
   *          active subscription or the unsubscribe operation fails.
   */
  unsubscribe() {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const doUnsubscribe = (sub) => {
      if (sub === null) {
        throw new RuntimeError(5602, (typeof ngDevMode === "undefined" || ngDevMode) && "Not subscribed to push notifications.");
      }
      return sub.unsubscribe().then((success) => {
        if (!success) {
          throw new RuntimeError(5603, (typeof ngDevMode === "undefined" || ngDevMode) && "Unsubscribe failed!");
        }
        this.subscriptionChanges.next(null);
      });
    };
    return new Promise((resolve, reject) => {
      this.subscription.pipe(take(1), switchMap(doUnsubscribe)).subscribe({
        next: resolve,
        error: reject
      });
    });
  }
  decodeBase64(input) {
    return atob(input);
  }
  static \u0275fac = function SwPush_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SwPush)(\u0275\u0275inject(NgswCommChannel));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _SwPush,
    factory: _SwPush.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SwPush, [{
    type: Injectable
  }], () => [{
    type: NgswCommChannel
  }], null);
})();
var SwUpdate = class _SwUpdate {
  sw;
  /**
   * Emits a `VersionDetectedEvent` event whenever a new version is detected on the server.
   *
   * Emits a `VersionInstallationFailedEvent` event whenever checking for or downloading a new
   * version fails.
   *
   * Emits a `VersionReadyEvent` event whenever a new version has been downloaded and is ready for
   * activation.
   */
  versionUpdates;
  /**
   * Emits an `UnrecoverableStateEvent` event whenever the version of the app used by the service
   * worker to serve this client is in a broken state that cannot be recovered from without a full
   * page reload.
   */
  unrecoverable;
  /**
   * True if the Service Worker is enabled (supported by the browser and enabled via
   * `ServiceWorkerModule`).
   */
  get isEnabled() {
    return this.sw.isEnabled;
  }
  constructor(sw) {
    this.sw = sw;
    if (!sw.isEnabled) {
      this.versionUpdates = NEVER;
      this.unrecoverable = NEVER;
      return;
    }
    this.versionUpdates = this.sw.eventsOfType(["VERSION_DETECTED", "VERSION_INSTALLATION_FAILED", "VERSION_READY", "NO_NEW_VERSION_DETECTED"]);
    this.unrecoverable = this.sw.eventsOfType("UNRECOVERABLE_STATE");
  }
  /**
   * Checks for an update and waits until the new version is downloaded from the server and ready
   * for activation.
   *
   * @returns a promise that
   * - resolves to `true` if a new version was found and is ready to be activated.
   * - resolves to `false` if no new version was found
   * - rejects if any error occurs
   */
  checkForUpdate() {
    if (!this.sw.isEnabled) {
      return Promise.reject(new Error(ERR_SW_NOT_SUPPORTED));
    }
    const nonce = this.sw.generateNonce();
    return this.sw.postMessageWithOperation("CHECK_FOR_UPDATES", {
      nonce
    }, nonce);
  }
  /**
   * Updates the current client (i.e. browser tab) to the latest version that is ready for
   * activation.
   *
   * In most cases, you should not use this method and instead should update a client by reloading
   * the page.
   *
   * <div class="docs-alert docs-alert-important">
   *
   * Updating a client without reloading can easily result in a broken application due to a version
   * mismatch between the application shell and other page resources,
   * such as lazy-loaded chunks, whose filenames may change between
   * versions.
   *
   * Only use this method, if you are certain it is safe for your specific use case.
   *
   * </div>
   *
   * @returns a promise that
   *  - resolves to `true` if an update was activated successfully
   *  - resolves to `false` if no update was available (for example, the client was already on the
   *    latest version).
   *  - rejects if any error occurs
   */
  activateUpdate() {
    if (!this.sw.isEnabled) {
      return Promise.reject(new RuntimeError(5601, (typeof ngDevMode === "undefined" || ngDevMode) && ERR_SW_NOT_SUPPORTED));
    }
    const nonce = this.sw.generateNonce();
    return this.sw.postMessageWithOperation("ACTIVATE_UPDATE", {
      nonce
    }, nonce);
  }
  static \u0275fac = function SwUpdate_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _SwUpdate)(\u0275\u0275inject(NgswCommChannel));
  };
  static \u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({
    token: _SwUpdate,
    factory: _SwUpdate.\u0275fac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(SwUpdate, [{
    type: Injectable
  }], () => [{
    type: NgswCommChannel
  }], null);
})();
var SCRIPT = new InjectionToken(ngDevMode ? "NGSW_REGISTER_SCRIPT" : "");
function ngswAppInitializer() {
  if (false) {
    return;
  }
  const options = inject(SwRegistrationOptions);
  if (!("serviceWorker" in navigator && options.enabled !== false)) {
    return;
  }
  const script = inject(SCRIPT);
  const ngZone = inject(NgZone);
  const appRef = inject(ApplicationRef);
  ngZone.runOutsideAngular(() => {
    const sw = navigator.serviceWorker;
    const onControllerChange = () => sw.controller?.postMessage({
      action: "INITIALIZE"
    });
    sw.addEventListener("controllerchange", onControllerChange);
    appRef.onDestroy(() => {
      sw.removeEventListener("controllerchange", onControllerChange);
    });
  });
  ngZone.runOutsideAngular(() => {
    let readyToRegister;
    const {
      registrationStrategy
    } = options;
    if (typeof registrationStrategy === "function") {
      readyToRegister = new Promise((resolve) => registrationStrategy().subscribe(() => resolve()));
    } else {
      const [strategy, ...args] = (registrationStrategy || "registerWhenStable:30000").split(":");
      switch (strategy) {
        case "registerImmediately":
          readyToRegister = Promise.resolve();
          break;
        case "registerWithDelay":
          readyToRegister = delayWithTimeout(+args[0] || 0);
          break;
        case "registerWhenStable":
          readyToRegister = Promise.race([appRef.whenStable(), delayWithTimeout(+args[0])]);
          break;
        default:
          throw new RuntimeError(5600, (typeof ngDevMode === "undefined" || ngDevMode) && `Unknown ServiceWorker registration strategy: ${options.registrationStrategy}`);
      }
    }
    readyToRegister.then(() => {
      if (appRef.destroyed) {
        return;
      }
      navigator.serviceWorker.register(script, {
        scope: options.scope
      }).catch((err) => console.error(formatRuntimeError(5604, (typeof ngDevMode === "undefined" || ngDevMode) && "Service worker registration failed with: " + err)));
    });
  });
}
function delayWithTimeout(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}
function ngswCommChannelFactory(opts, injector) {
  const isBrowser = true;
  return new NgswCommChannel(isBrowser && opts.enabled !== false ? navigator.serviceWorker : void 0, injector);
}
var SwRegistrationOptions = class {
  /**
   * Whether the ServiceWorker will be registered and the related services (such as `SwPush` and
   * `SwUpdate`) will attempt to communicate and interact with it.
   *
   * Default: true
   */
  enabled;
  /**
   * A URL that defines the ServiceWorker's registration scope; that is, what range of URLs it can
   * control. It will be used when calling
   * [ServiceWorkerContainer#register()](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register).
   */
  scope;
  /**
   * Defines the ServiceWorker registration strategy, which determines when it will be registered
   * with the browser.
   *
   * The default behavior of registering once the application stabilizes (i.e. as soon as there are
   * no pending micro- and macro-tasks) is designed to register the ServiceWorker as soon as
   * possible but without affecting the application's first time load.
   *
   * Still, there might be cases where you want more control over when the ServiceWorker is
   * registered (for example, there might be a long-running timeout or polling interval, preventing
   * the app from stabilizing). The available option are:
   *
   * - `registerWhenStable:<timeout>`: Register as soon as the application stabilizes (no pending
   *     micro-/macro-tasks) but no later than `<timeout>` milliseconds. If the app hasn't
   *     stabilized after `<timeout>` milliseconds (for example, due to a recurrent asynchronous
   *     task), the ServiceWorker will be registered anyway.
   *     If `<timeout>` is omitted, the ServiceWorker will only be registered once the app
   *     stabilizes.
   * - `registerImmediately`: Register immediately.
   * - `registerWithDelay:<timeout>`: Register with a delay of `<timeout>` milliseconds. For
   *     example, use `registerWithDelay:5000` to register the ServiceWorker after 5 seconds. If
   *     `<timeout>` is omitted, is defaults to `0`, which will register the ServiceWorker as soon
   *     as possible but still asynchronously, once all pending micro-tasks are completed.
   * - An Observable factory function: A function that returns an `Observable`.
   *     The function will be used at runtime to obtain and subscribe to the `Observable` and the
   *     ServiceWorker will be registered as soon as the first value is emitted.
   *
   * Default: 'registerWhenStable:30000'
   */
  registrationStrategy;
};
function provideServiceWorker(script, options = {}) {
  return makeEnvironmentProviders([SwPush, SwUpdate, {
    provide: SCRIPT,
    useValue: script
  }, {
    provide: SwRegistrationOptions,
    useValue: options
  }, {
    provide: NgswCommChannel,
    useFactory: ngswCommChannelFactory,
    deps: [SwRegistrationOptions, Injector]
  }, provideAppInitializer(ngswAppInitializer)]);
}
var ServiceWorkerModule = class _ServiceWorkerModule {
  /**
   * Register the given Angular Service Worker script.
   *
   * If `enabled` is set to `false` in the given options, the module will behave as if service
   * workers are not supported by the browser, and the service worker will not be registered.
   */
  static register(script, options = {}) {
    return {
      ngModule: _ServiceWorkerModule,
      providers: [provideServiceWorker(script, options)]
    };
  }
  static \u0275fac = function ServiceWorkerModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ServiceWorkerModule)();
  };
  static \u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({
    type: _ServiceWorkerModule
  });
  static \u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({
    providers: [SwPush, SwUpdate]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServiceWorkerModule, [{
    type: NgModule,
    args: [{
      providers: [SwPush, SwUpdate]
    }]
  }], null, null);
})();

// src/app/shared/services/auth.interceptor.ts
var AuthInterceptor = class _AuthInterceptor {
  constructor(authService, router) {
    this.authService = authService;
    this.router = router;
  }
  intercept(request, next) {
    console.log("\u{1F504} Interceptor: URL:", request.url);
    console.log("\u{1F504} Interceptor: M\xE9thode:", request.method);
    console.log("\u{1F504} Interceptor: Body:", request.body);
    console.log("\u{1F504} Interceptor: Body est FormData?", request.body instanceof FormData);
    const token = this.authService.getToken();
    if (this.isPublicRoute(request.url)) {
      console.log("\u{1F504} Interceptor: Route publique, pas de token");
      return next.handle(request);
    }
    if (!token) {
      console.log("\u274C Interceptor: Pas de token, redirection vers login");
      this.router.navigate(["/sessions/signin"]);
      return throwError(() => new Error("Non authentifi\xE9"));
    }
    let clonedRequest;
    if (request.body instanceof FormData) {
      console.log("\u2705 Interceptor: FormData d\xE9tect\xE9 - pas de Content-Type");
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      console.log("\u2705 Interceptor: Requ\xEAte normale - ajout Content-Type: application/json");
      clonedRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
    }
    console.log("\u{1F504} Interceptor: Headers de la requ\xEAte clon\xE9e:", clonedRequest.headers.keys());
    return next.handle(clonedRequest).pipe(catchError((error) => {
      return this.handleAuthError(error);
    }));
  }
  isPublicRoute(url) {
    const publicRoutes = [
      "/api/auth/login",
      "/api/auth/register",
      "/swagger-ui",
      "/v3/api-docs"
    ];
    return publicRoutes.some((route) => url.includes(route));
  }
  handleAuthError(error) {
    console.error("\u274C Interceptor: Erreur HTTP:", error.status, error.message);
    if (error.status === 401 || error.status === 403) {
      console.log("\u274C Interceptor: Token expir\xE9, d\xE9connexion...");
      this.authService.signout();
      this.router.navigate(["/sessions/signin"]);
      return throwError(() => new Error("Session expir\xE9e. Veuillez vous reconnecter."));
    }
    return throwError(() => error);
  }
  static {
    this.\u0275fac = function AuthInterceptor_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AuthInterceptor)(\u0275\u0275inject(AuthService), \u0275\u0275inject(Router));
    };
  }
  static {
    this.\u0275prov = /* @__PURE__ */ \u0275\u0275defineInjectable({ token: _AuthInterceptor, factory: _AuthInterceptor.\u0275fac });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AuthInterceptor, [{
    type: Injectable
  }], () => [{ type: AuthService }, { type: Router }], null);
})();

// src/app/app.module.ts
var AppModule = class _AppModule {
  static {
    this.\u0275fac = function AppModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _AppModule)();
    };
  }
  static {
    this.\u0275mod = /* @__PURE__ */ \u0275\u0275defineNgModule({ type: _AppModule, bootstrap: [AppComponent] });
  }
  static {
    this.\u0275inj = /* @__PURE__ */ \u0275\u0275defineInjector({ providers: [
      { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ], imports: [
      BrowserModule,
      // <-- SEULEMENT ici dans toute l'app
      BrowserAnimationsModule,
      SharedModule,
      HttpClientModule,
      InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }),
      AppRoutingModule,
      NgbModule,
      ChatbotAssistantComponent,
      ServiceWorkerModule.register("ngsw-worker.js", {
        enabled: !isDevMode(),
        // Register the ServiceWorker as soon as the application is stable
        // or after 30 seconds (whichever comes first).
        registrationStrategy: "registerWhenStable:30000"
      })
    ] });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(AppModule, [{
    type: NgModule,
    args: [{
      declarations: [AppComponent],
      imports: [
        BrowserModule,
        // <-- SEULEMENT ici dans toute l'app
        BrowserAnimationsModule,
        SharedModule,
        HttpClientModule,
        InMemoryWebApiModule.forRoot(InMemoryDataService, { passThruUnknownUrl: true }),
        AppRoutingModule,
        NgbModule,
        ChatbotAssistantComponent,
        ServiceWorkerModule.register("ngsw-worker.js", {
          enabled: !isDevMode(),
          // Register the ServiceWorker as soon as the application is stable
          // or after 30 seconds (whichever comes first).
          registrationStrategy: "registerWhenStable:30000"
        })
      ],
      providers: [
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
      ],
      bootstrap: [AppComponent]
    }]
  }], null, null);
})();

// src/main.ts
if (environment.production) {
  enableProdMode();
  if (!environment.enableDebug) {
    const noop = () => {
    };
    console.log = noop;
    console.info = noop;
    console.warn = noop;
  }
}
function handleBootstrapError(error) {
  console.error("Erreur fatale lors du d\xE9marrage de l'application:", error);
  const errorHtml = `
    <div style="
      font-family: 'Segoe UI', Arial, sans-serif;
      text-align: center;
      padding: 50px 20px;
      background: #f8f9fa;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 2px 20px rgba(0,0,0,0.1);
        max-width: 600px;
        width: 100%;
      ">
        <div style="margin-bottom: 30px;">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#dc3545" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        
        <h1 style="color: #343a40; margin-bottom: 20px; font-size: 24px;">
          Erreur de chargement de l'application
        </h1>
        
        <p style="color: #6c757d; margin-bottom: 25px; line-height: 1.6;">
          Une erreur est survenue lors du d\xE9marrage de l'application ${environment.appName}.
          ${environment.production ? "" : "D\xE9tails de l'erreur dans la console."}
        </p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 25px;">
          <p style="margin: 0; font-size: 14px; color: #495057;">
            <strong>Application :</strong> ${environment.appName}<br>
            <strong>Version :</strong> ${environment.version}<br>
            <strong>Mode :</strong> ${environment.production ? "Production" : "D\xE9veloppement"}<br>
            <strong>API Backend :</strong> ${environment.apiUrl}
          </p>
        </div>
        
        <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" style="
            padding: 12px 30px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#0056b3'" onmouseout="this.style.background='#007bff'">
            Rafra\xEEchir la page
          </button>
          
          <button onclick="testBackendConnection()" style="
            padding: 12px 30px;
            background: #28a745;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#218838'" onmouseout="this.style.background='#28a745'">
            Tester la connexion
          </button>
          
          <button onclick="history.back()" style="
            padding: 12px 30px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: background 0.3s;
          " onmouseover="this.style.background='#545b62'" onmouseout="this.style.background='#6c757d'">
            Retour
          </button>
        </div>
        
        <div id="testResult" style="margin-top: 20px; display: none;"></div>
        
        <p style="margin-top: 25px; font-size: 14px; color: #6c757d;">
          Si le probl\xE8me persiste, v\xE9rifiez que le serveur backend est d\xE9marr\xE9 sur ${environment.apiUrl}
        </p>
      </div>
    </div>
  `;
  document.body.innerHTML = errorHtml;
  document.title = "Erreur - " + environment.appName;
  window.testBackendConnection = function() {
    return __async(this, null, function* () {
      const resultDiv = document.getElementById("testResult");
      if (resultDiv) {
        resultDiv.style.display = "block";
        resultDiv.innerHTML = '<p style="color: #6c757d;">Test de connexion en cours...</p>';
        try {
          const response = yield fetch(`${environment.apiUrl}/test/cors`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            }
          });
          if (response.ok) {
            const data = yield response.text();
            resultDiv.innerHTML = `
            <p style="color: #28a745;">
              \u2705 Connexion r\xE9ussie!<br>
              <small>Backend: ${environment.apiUrl}</small><br>
              <small>R\xE9ponse: ${data}</small>
            </p>
          `;
          } else {
            resultDiv.innerHTML = `
            <p style="color: #dc3545;">
              \u274C Erreur de connexion (${response.status})<br>
              <small>Backend: ${environment.apiUrl}</small>
            </p>
          `;
          }
        } catch (error2) {
          resultDiv.innerHTML = `
          <p style="color: #dc3545;">
            \u274C Impossible de se connecter au serveur<br>
            <small>Erreur: ${error2.message}</small><br>
            <small>Assurez-vous que Spring Boot est d\xE9marr\xE9 sur localhost:8080</small>
          </p>
        `;
        }
      }
    });
  };
}
function bootstrapApplication() {
  if (!environment.production) {
    console.log(`D\xE9marrage ${environment.appName} v${environment.version}`);
    console.log(`Environnement: ${environment.production ? "Production" : "D\xE9veloppement"}`);
    console.log(`API Backend: ${environment.apiUrl}`);
  }
  platformBrowser().bootstrapModule(AppModule).catch(handleBootstrapError);
}
function checkNetworkConnection() {
  if (!navigator.onLine) {
    console.warn("Application d\xE9marr\xE9e hors ligne");
    window.addEventListener("online", () => {
      console.info("Connexion r\xE9seau r\xE9tablie");
      if (sessionStorage.getItem("refreshOnOnline") === "true") {
        sessionStorage.removeItem("refreshOnOnline");
        window.location.reload();
      }
    });
    window.addEventListener("offline", () => {
      console.warn("Connexion r\xE9seau perdue");
      sessionStorage.setItem("refreshOnOnline", "true");
    });
  }
}
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    checkNetworkConnection();
    bootstrapApplication();
  });
} else {
  checkNetworkConnection();
  bootstrapApplication();
}
window.addEventListener("error", (event) => {
  console.error("Erreur globale captur\xE9e:", event.error);
  if (!environment.production || environment.enableDebug) {
    console.error("Stack trace:", event.error?.stack);
  }
});
window.addEventListener("unhandledrejection", (event) => {
  console.error("Promesse non g\xE9r\xE9e rejet\xE9e:", event.reason);
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    console.debug("Page visible");
  } else {
    console.debug("Page cach\xE9e");
  }
});
/*! Bundled license information:

@angular/animations/fesm2022/util-D9FfmVnv.mjs:
@angular/animations/fesm2022/browser.mjs:
@angular/platform-browser/fesm2022/animations.mjs:
  (**
   * @license Angular v19.2.14
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)

angular-in-memory-web-api/fesm2022/angular-in-memory-web-api.mjs:
  (**
   * @license Angular v19.1.0-next.0
   * (c) 2010-2024 Google LLC. https://angular.io/
   * License: MIT
   *)

@angular/service-worker/fesm2022/service-worker.mjs:
  (**
   * @license Angular v19.2.17
   * (c) 2010-2025 Google LLC. https://angular.io/
   * License: MIT
   *)
  (*!
   * @license
   * Copyright Google LLC All Rights Reserved.
   *
   * Use of this source code is governed by an MIT-style license that can be
   * found in the LICENSE file at https://angular.dev/license
   *)
*/
//# sourceMappingURL=main.js.map
