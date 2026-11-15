# Clawd scenes

Little pixel Clawds living behind the chat in Claude Code, in five scenes: Café, Beach, Garden, Snow and Campfire. Type `/clawd-scenes` to open a picker above the message box. Clicking a scene opens it in a circle that grows from the tile you clicked.

Scenes are drawn behind the chat in the Claude desktop app and on mobile. The terminal doesn't show them.

## Install

In a normal terminal (the `%` or `$` prompt), run these two lines:

```
claude plugin marketplace add JessToudic/clawd-scenes
claude plugin install clawd-scenes@clawd-scenes
```

Or, inside a Claude Code session (after typing `claude`):

```
/plugin marketplace add JessToudic/clawd-scenes
/plugin install clawd-scenes@clawd-scenes
```

In the desktop app, where `/plugin` doesn't run: click + next to the prompt box, then Plugins, then Add marketplace with `JessToudic/clawd-scenes`, then Add plugin.

Start a new session afterwards, then type `/clawd-scenes`.

## Use

- `/clawd-scenes` opens the picker. Tab or the arrow keys move between scenes, and Esc closes it.
- `/clawd-scenes <name>` picks a scene directly, for example `/clawd-scenes snow`.
- `/clawd-scenes list` lists the scenes.
- `/clawd-scenes off` goes back to the app's own look.
