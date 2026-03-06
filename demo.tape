# VHS tape file for recording histy demo GIF
# Run: vhs demo.tape

Output demo.gif

Set Shell "zsh"
Set FontSize 16
Set Width 1000
Set Height 550
Set Padding 20
Set Theme "Catppuccin Mocha"
Set TypingSpeed 60ms

# Launch histy
Type "histy"
Enter
Sleep 1s

# Browse with j/k
Sleep 500ms
Type "j"
Sleep 400ms
Type "j"
Sleep 400ms
Type "j"
Sleep 400ms
Type "k"
Sleep 400ms
Type "k"
Sleep 600ms

# Jump to bottom and back
Type "G"
Sleep 600ms
Type "g"
Sleep 600ms

# Switch views with Tab
Tab
Sleep 800ms
Tab
Sleep 800ms
Tab
Sleep 600ms

# Search for a command
Type "/"
Sleep 400ms
Type "git"
Sleep 800ms

# Commit search with Enter
Enter
Sleep 600ms

# Navigate filtered results
Type "j"
Sleep 400ms
Type "k"
Sleep 600ms

# Clear search with ESC
Escape
Sleep 600ms

# Copy a command
Type "c"
Sleep 1s

# Show help overlay
Type "?"
Sleep 1.5s

# Dismiss help
Type "q"
Sleep 500ms

# Quit
Type "q"
Sleep 500ms
