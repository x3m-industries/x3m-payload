# Discord Announcement Draft

**Channel:** `#showcase`
**Subject:** Type-safe services & Production fields for Payload 3.0

Hey everyone! 👋

I've been working on a toolkit to solve some of the common "boilerplate fatigue" I faced when scaling Payload apps, and I wanted to share it with the community.

It’s called **x3m-payload**, and it splits into two main packages that work great with **Payload 3.0 / Next.js App Router**:

1.  **`@x3m-industries/lib-services`**: A plugin that adds a fully typed `.services` layer to your payload instance.
    - Stop writing `payload.find({ collection: 'orders' })` with magic strings.
    - Start writing `payload.services.orders.findMany()` with full intellisense.
    - Define custom methods like `markShipped()` directly on your collection config and have them auto-typed everywhere.

2.  **`@x3m-industries/lib-fields`**: standardized, "smart" fields that just work.
    - **Phone**: Validates with `libphonenumber-js` (E.164 storage).
    - **VAT**: Validates EU VAT numbers (format + checksum).
    - **IDs**: UUIDv7, Nanoid, CUID2 specific fields.

I built this because I wanted something closer to a NestJS service architecture but with Payload's flexibility.

**Check it out here:**
🔗 https://github.com/x3m-industries/x3m-payload

Would love to hear if this fits your workflow or if you have any feature requests!
