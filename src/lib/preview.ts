import { useState, useEffect } from 'react'
import { localLiteStorage } from 'ltstrg'
import { previewStyleKey } from './localStorageKeys'
import { createStoreContext } from './utils/context'

export const defaultPreviewStyle = `
-ms-text-size-adjust: 100%;
-webkit-text-size-adjust: 100%;
line-height: 1.5;
color: #24292e;
font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial,
  sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
font-size: 16px;
line-height: 1.5;
word-wrap: break-word;

.dark, .solarizedDark {
  color: #FFF;
}

details {
  display: block;
}

summary {
  display: list-item;
}

a {
  background-color: transparent;
}

a:active,
a:hover {
  outline-width: 0;
}

strong {
  font-weight: inherit;
  font-weight: bolder;
}

h1 {
  font-size: 2em;
  margin: 0.67em 0;
}

img {
  border-style: none;
}

code,
kbd,
pre {
  font-family: monospace, monospace;
  font-size: 1em;
}

hr {
  box-sizing: content-box;
  height: 0;
  overflow: visible;
}

input {
  font: inherit;
  margin: 0;
}

input {
  overflow: visible;
}

[type='checkbox'] {
  box-sizing: border-box;
  padding: 0;
}

* {
  box-sizing: border-box;
}

input {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

a {
  color: #0366d6;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

strong {
  font-weight: 600;
}

hr {
  background: transparent;
  border: 0;
  border-bottom: 1px solid #dfe2e5;
  height: 0;
  margin: 15px 0;
  overflow: hidden;
}

hr:before {
  content: '';
  display: table;
}

hr:after {
  clear: both;
  content: '';
  display: table;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

td,
th {
  padding: 0;
}

details summary {
  cursor: pointer;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  margin-bottom: 0;
  margin-top: 0;
}

h1 {
  font-size: 32px;
}

h1,
h2 {
  font-weight: 600;
}

h2 {
  font-size: 24px;
}

h3 {
  font-size: 20px;
}

h3,
h4 {
  font-weight: 600;
}

h4 {
  font-size: 16px;
}

h5 {
  font-size: 14px;
}

h5,
h6 {
  font-weight: 600;
}

h6 {
  font-size: 12px;
}

p {
  margin-bottom: 10px;
  margin-top: 0;
}

blockquote {
  margin: 0;
}

ol,
ul {
  margin-bottom: 0;
  margin-top: 0;
  padding-left: 0;
}

ol ol,
ul ol {
  list-style-type: lower-roman;
}

ol ol ol,
ol ul ol,
ul ol ol,
ul ul ol {
  list-style-type: lower-alpha;
}

dd {
  margin-left: 0;
}

code,
pre {
  font-family: SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
  font-size: 12px;
}

pre {
  margin-bottom: 0;
  margin-top: 0;
}

input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

&:before {
  content: '';
  display: table;
}

&:after {
  clear: both;
  content: '';
  display: table;
}

> :first-child {
  margin-top: 0 !important;
}

> :last-child {
  margin-bottom: 0 !important;
}

a:not([href]) {
  color: inherit;
  text-decoration: none;
}

blockquote,
dl,
ol,
p,
pre,
table,
ul {
  margin-bottom: 16px;
  margin-top: 0;
}

hr {
  background-color: #e1e4e8;
  border: 0;
  height: 0.25em;
  margin: 24px 0;
  padding: 0;
}

blockquote {
  border-left: 0.25em solid #dfe2e5;
  color: #6a737d;
  padding: 0 1em;
}

blockquote > :first-child {
  margin-top: 0;
}

blockquote > :last-child {
  margin-bottom: 0;
}

kbd {
  background-color: #fafbfc;
  border: 1px solid #c6cbd1;
  border-bottom-color: #959da5;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #959da5;
  color: #444d56;
  display: inline-block;
  font-size: 11px;
  line-height: 10px;
  padding: 3px 5px;
  vertical-align: middle;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-weight: 600;
  line-height: 1.25;
  margin-bottom: 16px;
  margin-top: 24px;
}

h1 {
  font-size: 2em;
}

h1,
h2 {
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
}

h2 {
  font-size: 1.5em;
}

h3 {
  font-size: 1.25em;
}

h4 {
  font-size: 1em;
}

h5 {
  font-size: 0.875em;
}

h6 {
  color: #6a737d;
  font-size: 0.85em;
}

ol,
ul {
  padding-left: 2em;
}

ol ol,
ol ul,
ul ol,
ul ul {
  margin-bottom: 0;
  margin-top: 0;
}

li {
  word-wrap: break-all;
}

li > p {
  margin-top: 16px;
}

li + li {
  margin-top: 0.25em;
}

dl {
  padding: 0;
}

dl dt {
  font-size: 1em;
  font-style: italic;
  font-weight: 600;
  margin-top: 16px;
  padding: 0;
}

dl dd {
  margin-bottom: 16px;
  padding: 0 16px;
}

table {
  display: block;
  overflow: auto;
  width: 100%;
}

table th {
  font-weight: 600;
}

table td,
table th {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
}

table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

img {
  background-color: #fff;
  box-sizing: content-box;
  max-width: 100%;
}

img[align='right'] {
  padding-left: 20px;
}

img[align='left'] {
  padding-right: 20px;
}

code {
  background-color: rgba(27, 31, 35, 0.05);
  border-radius: 3px;
  font-size: 85%;
  margin: 0;
  padding: 0.2em 0.4em;
}

pre {
  word-wrap: normal;
}

pre > code {
  background: transparent;
  border: 0;
  font-size: 100%;
  margin: 0;
  padding: 0;
  white-space: pre;
  word-break: normal;
}

.highlight {
  margin-bottom: 16px;
}

.highlight pre {
  margin-bottom: 0;
  word-break: normal;
}

.highlight pre,
pre {
  background-color: #f6f8fa;
  border-radius: 3px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 16px;
}

pre code {
  background-color: transparent;
  border: 0;
  display: inline;
  line-height: inherit;
  margin: 0;
  max-width: auto;
  overflow: visible;
  padding: 0;
  word-wrap: normal;
}

kbd {
  background-color: #fafbfc;
  border: 1px solid #d1d5da;
  border-bottom-color: #c6cbd1;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #c6cbd1;
  color: #444d56;
  display: inline-block;
  font: 11px SFMono-Regular, Consolas, Liberation Mono, Menlo, Courier,
    monospace;
  line-height: 10px;
  padding: 3px 5px;
  vertical-align: middle;
}

:checked + .radio-label {
  border-color: #0366d6;
  position: relative;
  z-index: 1;
}

.task-list-item {
  list-style-type: none;
}

.task-list-item + .task-list-item {
  margin-top: 3px;
}

.task-list-item input {
  margin: 0 0.2em 0.25em -1.6em;
  vertical-align: middle;
}

hr {
  border-bottom-color: #eee;
}
`

function loadPreviewStyle() {
  const previewStyle = localLiteStorage.getItem(previewStyleKey)
  if (previewStyle == null) return defaultPreviewStyle
  return previewStyle
}

function savePreviewStyle(style: string) {
  return localLiteStorage.setItem(previewStyleKey, style)
}

const initialPreviewStyle = loadPreviewStyle()

function usePreviewStyleStore() {
  const [previewStyle, setPreviewStyle] = useState(initialPreviewStyle)

  useEffect(() => {
    savePreviewStyle(previewStyle)
  }, [previewStyle])

  return {
    previewStyle,
    setPreviewStyle
  }
}

export const {
  StoreProvider: PreviewStyleProvider,
  useStore: usePreviewStyle
} = createStoreContext(usePreviewStyleStore, 'previewStyle')
