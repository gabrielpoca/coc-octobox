# coc-octobox

coc-octobox is a [coc.nvim](https://github.com/neoclide/coc.nvim) for [Octobox](https://octobox.io/).

It supports:
* showing and filtering the notifications list.
* opening in browser and marking as read.
* archiving notifications.
* muting notifications.

## Setup

Just install it like any other [coc.nvim extension](https://github.com/neoclide/coc.nvim/wiki/Using-coc-extensions#install-extensions), for instance:

```
:CocInstall https://github.com/gabrielpoca/coc-octobox
```

And setup the following variables in your environment:

* **OCTOBOX_URL** should be the base url of your octobox instance.
* **OCTOBOX_TOKEN** should be your API token that you can the settings page in Octobox.

## Usage

To show the list of notification run `:CocList octobox`. You can give this command a shortcut, for instance:

```
nnoremap <Leader>gn :CocList octobox<CR>
```
