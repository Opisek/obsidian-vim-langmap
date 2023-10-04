# Scope and Use-Case Scenarios

This plugin is my personal necessity to be able to use obsidian.

I am a Vim user.

I am also a Dvorak user.

Vim has a feature called "langmap" that lets people with alternate keyboard layouts (either completely different script like cyrillic or different layout like Dvorak)
remap their keyboards in normal/visual mode back to qwerty, so they can take advantage of Vim's keybindings just fine.
However, in insert/replace mode they can still type like they're used to with their respective script or layout.
This very feature is essential to us.

Unfortunately, whenever someone makes a Vim emulator for their application, they simply overlook this (arguably simple to add) nuance,
rendering their app utterly unusable to people who rely on it. So is the case with CodeMirror that Obsidian relies on for Vim emulation.

Since this problem is not inherit to Obsidian, but rather to CodeMirror, it is not possible to create an ideal plugin for this.
The idea behind this project is to simulate what a langmap should do in a hacky way.

This piece of code relies on the user's Windows operating system (might add Linux in the future) to have both their layout of choice (e.g. Dvorak),
as well as a QWERTY keyboard installed. Whenever the Obsidian app is focused, within Obsidian the code editor is focused, and the code's editor Vim mode is in normal or visual mode,
the plugin calls an external binary that switches the layout to QWERTY.
For all other cases, e.g. writing text in insert mode, tweaking Obsidian settings, tabbing out of Obsidian or exiting Obsidian completely,
the layout is switched back to the user's preferred layout.

This aims to provide as seamless an experience as possible.
Unfortunately, there's no way to make keybindings like f\<character> or r\<character> behave properly. For bindings like this, the \<character> part should not be remapped to QWERTY. Because this plugin doesn't touch CodeMirror's source code, we have no way of knowing when such a character is read, so we cannot simply switch back.

# Future Prospect

Regarding mappings like f\<character> and r\<character>, I will check to see if CodeMirror provides any way of listening in on the current character buffer. If so, then we could detect these keybindings and switch the keyboard before the user presses the character that is not to be remapped.

Still though, it's apparent that this project is more of a hack than a fix. If time allows, I might look into baking langmap directly into CodeMirror through a pull request. Should that be merged then Obsidian and other apps that rely on CodeMirror like Joplin will get Vim's langmap out of the box (or rather with minimal plugin writing requirement, so that feature can actually be accessed through a pseudo .vimrc file).