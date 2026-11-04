import { useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { getPortalContainer } from '@cuttle-ui/core';
import { LayerContainerContext } from './primitives';

/** Renders into the surrounding dialog if there is one, otherwise into the body. */
export function Layer({ children }: { children: ReactNode }) {
  const parent = useContext(LayerContainerContext);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  const container = parent ?? getPortalContainer();
  return container ? createPortal(children, container) : null;
}
