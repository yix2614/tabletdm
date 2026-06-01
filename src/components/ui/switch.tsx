import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className = '', ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={['ui-switch', className].filter(Boolean).join(' ')}
    {...props}
  >
    <SwitchPrimitive.Thumb className="ui-switch-thumb" />
  </SwitchPrimitive.Root>
))

Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
