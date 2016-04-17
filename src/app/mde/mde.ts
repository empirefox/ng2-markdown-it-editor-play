import {Component, Input, EventEmitter, ElementRef, OnInit, OnDestroy, AfterViewInit} from 'angular2/core';
import {Subject} from 'rxjs';

let CodeMirror = require('codemirror/lib/codemirror');
let markdownit = require('markdown-it');
let markdownitFootnote = require('markdown-it-footnote');
let markdownitEmoji = require('markdown-it-emoji');

declare var twemoji: any;

@Component({
  selector: 'mde',
  styles: [require('./mde.css')],
  template: require('./mde.html')
})
export class Mde implements OnInit, AfterViewInit, OnDestroy {
  @Input() public txt: string = 'hello `Mde` component';

  rendered: string = '';

  private cm: any;
  private md: any;
  private contentChange = new Subject<any>();

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.md = markdownit({
      html: true
    }).use(markdownitFootnote).use(markdownitEmoji);
    this.md.renderer.rules.emoji = (token, idx) => twemoji.parse(token[idx].content);

    this.contentChange.debounceTime(600).subscribe((e: any) => {
      this.rendered = this.md.render(e.getValue());
    });
    this.rendered = this.md.render(this.txt);
  }

  ngAfterViewInit() {
    let code = this.elementRef.nativeElement.querySelector('textarea');
    this.cm = CodeMirror.fromTextArea(code, {
      autofocus: true,
      mode: 'gfm',
      lineNumbers: false,
      matchBrackets: true,
      lineWrapping: true,
      theme: 'base16-light',
      extraKeys: { Enter: 'newlineAndIndentContinueMarkdownList' }
    });

    this.cm.setSize('auto', '100%');
    this.cm.setValue(this.txt);

    this.cm.on('change', e => {
      this.contentChange.next(e);
    });
  }

  ngOnDestroy() {
    this.cm.removeEventListener('change');
  }
}
