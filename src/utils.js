import { activeInstances } from './engine';

export function removeInsFromActiveInstances(ins) {
  const tlIndex = activeInstances.indexOf(ins);
  if (tlIndex > -1) {
    activeInstances.splice(tlIndex, 1);
  }
}

export function removeInsFromParent(ins) {
  const parent = ins.parent;
  const parentChildren = parent.children;

  if ('reversedInTl' in ins) {
    delete ins.reversedInTl;
  }

  const insIndex = parentChildren.indexOf(ins);
  ~insIndex && parentChildren.splice(insIndex, 1);
}
