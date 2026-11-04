import { useState } from 'react';
import { Button } from '@cuttle-ui/react';
import type { ButtonSize, ButtonVariant } from '@cuttle-ui/react';

const VARIANTS: ButtonVariant[] = ['solid', 'outline', 'soft', 'ghost', 'link', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

function ButtonSection() {
  const [presses, setPresses] = useState(0);

  return (
    <section aria-labelledby="button">
      <h2 id="button">Button</h2>
      <div className="demo-rows">
        {SIZES.map((size) => (
          <div key={size} className="demo-row">
            {VARIANTS.map((variant) => (
              <Button key={variant} variant={variant} size={size}>
                {variant} {size}
              </Button>
            ))}
          </div>
        ))}
        <div className="demo-row">
          <Button loading>Saving</Button>
          <Button loading variant="outline">
            Saving outline
          </Button>
          <Button disabled>Disabled</Button>
          <Button disabled variant="outline">
            Disabled outline
          </Button>
          <Button asChild variant="outline">
            <a href="#button">Link as button</a>
          </Button>
          <Button asChild disabled variant="outline">
            <a href="#button">Disabled link</a>
          </Button>
        </div>
        <div className="demo-row">
          <Button variant="soft" onClick={() => setPresses((count) => count + 1)}>
            Press me
          </Button>
          <output aria-label="Press count">{presses}</output>
        </div>
      </div>
    </section>
  );
}

export function Components() {
  return <ButtonSection />;
}
