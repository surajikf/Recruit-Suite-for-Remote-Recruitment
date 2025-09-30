# How we themed Tailwind

- Palette mapped in `tailwind.config.js` to LinkedIn-inspired colors:
  - `primary` #0A66C2, `primaryDark` #004182, `primaryLight` #E8F3FF
  - `background` #F3F2EF, `surface` #FFFFFF, `text` #0F172A, `muted` #6B7280
- Utility components in `src/index.css` layer:
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.badge`, `.card`, `.input`, `.container`, `nav-item*`
- Type scale: h1/h2/h3/body via utilities; spacing rhythm 8/16; container `max-w-7xl`.
- Accessibility: focus-visible rings on interactive controls; AA contrast ensured.
