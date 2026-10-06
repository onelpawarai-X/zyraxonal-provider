<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the model directory in a shared React feature with separate Models, Providers and Labs routes so navigation stays addressable.
- Use a build-processed catalog snapshot for initial reads and CDN assets for complete JSON downloads so SSR needs no external API.
- Preserve upstream provider identities and MIT license notices independently from site branding so rebranding never alters provider records.
