setlocal wildignore+=dist

" Syntastic options
let g:syntastic_html_tidy_ignore_errors = [
  \ ' proprietary attribute "ng-',
  \ 'trimming empty <span>'
  \ ]

" javascript-libraries-syntax.vim
let g:used_javascript_libs = 'angularjs,angularui'
