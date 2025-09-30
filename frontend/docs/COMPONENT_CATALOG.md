# Component Catalog (Tailwind-ready)

Notes:
- Keep motion subtle; ensure focus-visible rings and AA contrast.
- All examples are copy-paste ready into React components.

## Button

```tsx
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A66C2] focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
  const sizeCls = size === 'sm' ? 'px-3 py-1.5 text-sm' : size === 'lg' ? 'px-5 py-2.5 text-sm' : 'px-4 py-2 text-sm'
  const variants: Record<string, string> = {
    primary: 'bg-[#0A66C2] text-white hover:bg-[#004182]',
    secondary: 'bg-white text-[#0A66C2] border border-[#0A66C2]/30 hover:bg-[#E8F3FF]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button className={[base, sizeCls, variants[variant], className].join(' ')} {...rest}>
      {loading && <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />}
      {children}
    </button>
  )
}
```

## Input / Textarea

```tsx
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-gray-400 shadow-sm',
        'focus:border-[#0A66C2] focus:ring-[#0A66C2] focus:outline-none focus:ring-2',
        props.className || '',
      ].join(' ')}
    />
  )
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-gray-400 shadow-sm',
        'focus:border-[#0A66C2] focus:ring-[#0A66C2] focus:outline-none focus:ring-2',
        props.className || '',
      ].join(' ')}
    />
  )
}
```

## Badge / Chip

```tsx
type BadgeProps = { variant?: 'info' | 'success' | 'neutral'; children: React.ReactNode; className?: string }
export function Badge({ variant = 'neutral', children, className = '' }: BadgeProps) {
  const variants: Record<string, string> = {
    info: 'bg-[#E8F3FF] text-[#004182]',
    success: 'bg-emerald-50 text-emerald-700',
    neutral: 'bg-gray-100 text-gray-700',
  }
  return <span className={[`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium`, variants[variant], className].join(' ')}>{children}</span>
}
```

## Card

```tsx
export function Card({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <div className={[`bg-white rounded-[12px] shadow-sm border border-gray-100 p-4 md:p-6`, className].join(' ')}>{children}</div>
}
```

## Tabs (headless)

```tsx
type Tab = { id: string; label: string }
export function Tabs({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div>
      <div className="border-b border-gray-200 flex items-center gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            aria-current={t.id === active ? 'page' : undefined}
            className={[
              'px-3 py-2 text-sm',
              t.id === active ? 'text-[#0A66C2] border-b-2 border-[#0A66C2]' : 'text-gray-600 hover:text-[#0A66C2]'
            ].join(' ')}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
```

## Modal (basic)

```tsx
export function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-lg">{children}</div>
      </div>
    </div>
  )
}
```

## Toast (pattern)

```tsx
// Use your favorite toast lib. Styling reference:
// container: fixed top-4 right-4 flex flex-col gap-2 z-[60]
// toast: bg-white rounded-lg shadow-md border border-gray-100 px-4 py-3 text-sm
```

## Search Input (header)

```tsx
export function SearchInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
      </div>
      <input {...props} className="pl-10 pr-3 py-2 w-full rounded-lg border border-gray-300 bg-white text-sm focus:border-[#0A66C2] focus:ring-[#0A66C2] focus:outline-none focus:ring-2" />
    </div>
  )
}
```


