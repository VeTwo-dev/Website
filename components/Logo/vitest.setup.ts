// jsdom lacks AnimationEvent; React feature-detects it at import time to pick the animationend event name.
if (!('AnimationEvent' in window)) {
  ;(window as unknown as Record<string, unknown>).AnimationEvent = class AnimationEvent extends Event {}
}
