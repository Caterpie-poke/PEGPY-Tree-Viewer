# PEGPY-Tree-Viewer
+ AST tree viewer extension for VSCode.
+ Required AST is output of PEGPY.
+ This extension is implemented in JavaScript.


## How to Install
Install from VSCode MarketPlace.


## Usage
+ From Command Pallet (mac:`command+shift+P`, windows:`ctrl+shift+P`) , execute `PEGPY Tree Viewer`.
+ Enter the AST code (e.g. `[#A [#B 'hoge'] [#C 'fuga']]`) into the InputBox.
+ Tree will be shown as HTML.


## Known Issues
+ Can't parse 'Label' (e.g. `[#A left:[#B 'hoge'] right:[#C 'fuga']]`)
+ If the AST is too long sideways, part of the AST will be showed in next line.
+ The only way to save AST as image is to take screenshot.
  + mac:`command+shift+control+4` -> take any size of screenshot and save to clipboard
  + windows: I don't know


## Release Notes
### 0.0.1
Initial release.

