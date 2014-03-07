// Copyright 2013 Clark DuVall
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var COMMANDS = COMMANDS || {};

COMMANDS.cat =  function(argv, cb) {
   var filenames = this._terminal.parseArgs(argv).filenames,
       stdout;

   this._terminal.scroll();
   if (!filenames.length) {
      this._terminal.returnHandler = function() {
         stdout = this.stdout();
         if (!stdout)
            return;
         stdout.innerHTML += '<br>' + stdout.innerHTML + '<br>';
         this.scroll();
         this.newStdout();
      }.bind(this._terminal);
      return;
   }
   filenames.forEach(function(filename, i) {
      var entry = this._terminal.getEntry(filename);

      if (!entry)
         this._terminal.write('cat: ' + filename + ': No such file or directory');
      else if (entry.type === 'dir')
         this._terminal.write('cat: ' + filename + ': Is a directory.');
      else
         this._terminal.write(entry.contents);
      if (i !== filenames.length - 1)
         this._terminal.write('<br>');
   }, this);
   cb();
}

COMMANDS.echo =  function(argv, cb) {
   var text = argv,
       stdout;
       this._terminal.write(text);
   cb();
}

COMMANDS.cd = function(argv, cb) {
   var filename = this._terminal.parseArgs(argv).filenames[0],
       entry;

   if (!filename)
      filename = '~';
   entry = this._terminal.getEntry(filename);
   if (!entry)
      this._terminal.write('bash: cd: ' + filename + ': No such file or directory');
   else if (entry.type !== 'dir')
      this._terminal.write('bash: cd: ' + filename + ': Not a directory.');
   else
      this._terminal.cwd = entry;
   cb();
}

COMMANDS.ls = function(argv, cb) {
   var result = this._terminal.parseArgs(argv),
       args = result.args,
       filename = result.filenames[0],
       entry = filename ? this._terminal.getEntry(filename) : this._terminal.cwd,
       maxLen = 0,
       writeEntry;

   writeEntry = function(e, str) {
      this.writeLink(e, str);
      if (args.indexOf('l') > -1) {
         if ('description' in e)
            this.write(' - ' + e.description);
         this.write('<br>');
      } else {
         // Make all entries the same width like real ls. End with a normal
         // space so the line breaks only after entries.
         this.write(Array(maxLen - e.name.length + 2).join('&nbsp') + ' ');
      }
   }.bind(this._terminal);

   if (!entry)
      this._terminal.write('ls: cannot access ' + filename + ': No such file or directory');
   else if (entry.type === 'dir') {
      var dirStr = this._terminal.dirString(entry);
      maxLen = entry.contents.reduce(function(prev, cur) {
         return Math.max(prev, cur.name.length);
      }, 0);

      for (var i in entry.contents) {
         var e = entry.contents[i];
         if (args.indexOf('a') > -1 || e.name[0] !== '.')
            writeEntry(e, dirStr + '/' + e.name);
      }
   } else {
      maxLen = entry.name.length;
      writeEntry(entry, filename);
   }
   cb();
}

COMMANDS.gimp = function(argv, cb) {
   var filename = this._terminal.parseArgs(argv).filenames[0],
       entry,
       imgs;

   if (!filename) {
      this._terminal.write('gimp: please specify an image file.');
      cb();
      return;
   }

   entry = this._terminal.getEntry(filename);
   if (!entry || entry.type !== 'img') {
      this._terminal.write('gimp: file ' + filename + ' is not an image file.');
   } else {
      this._terminal.write('<img src="' + entry.contents + '"/>');
      imgs = this._terminal.div.getElementsByTagName('img');
      imgs[imgs.length - 1].onload = function() {
         this.scroll();
      }.bind(this._terminal);
      if ('caption' in entry)
         this._terminal.write('<br/>' + entry.caption);
   }
   cb();
}

COMMANDS.clear = function(argv, cb) {
   this._terminal.div.innerHTML = '';
   cb();
}

COMMANDS.sudo = function(argv, cb) {
   var count = 0;
   this._terminal.returnHandler = function() {
      if (++count < 3) {
         this.write('<br/>Sorry, try again.<br/>');
         this.write('[sudo] password for ' + this.config.username + ': ');
         this.scroll();
      } else {
         this.write('<br/>sudo: 3 incorrect password attempts');
         cb();
      }
   }.bind(this._terminal);
   this._terminal.write('[sudo] password for ' + this._terminal.config.username + ': ');
   this._terminal.scroll();
}

COMMANDS.login = function(argv, cb) {
   this._terminal.returnHandler = function() {
      var username = this.stdout().innerHTML;

      this.scroll();
      if (username)
         this.config.username = username;
      this.write('<br>Password: ');
      this.scroll();
      this.returnHandler = function() { cb(); }
   }.bind(this._terminal);
   this._terminal.write('Username: ');
   this._terminal.newStdout();
   this._terminal.scroll();
}

COMMANDS.tree = function(argv, cb) {
   var term = this._terminal,
       home;

   function writeTree(dir, level) {
      dir.contents.forEach(function(entry) {
         var str = '';

         if (entry.name.startswith('.'))
            return;
         for (var i = 0; i < level; i++)
            str += '|  ';
         str += '|&mdash;&mdash;';
         term.write(str);
         term.writeLink(entry, term.dirString(dir) + '/' + entry.name);
         term.write('<br>');
         if (entry.type === 'dir')
            writeTree(entry, level + 1);
      });
   };
   home = this._terminal.getEntry('~');
   this._terminal.writeLink(home, '~');
   this._terminal.write('<br>');
   writeTree(home, 0);
   cb();
}

COMMANDS.help = function(argv, cb) {
   this._terminal.write(
         ' \u6587\u7AE0\u548C\u76EE\u5F55\u5747\u53EF\u4EE5\u70B9\u51FB\u8BBF\u95EE\u3002<br>'
+ ' \u67E5\u770B\u6587\u7AE0\u5217\u8868\u8BF7\u4F7F\u7528 <span class="dir"><a href="javascript:void(0)" onclick="typeCommand(\'ls -l\')">ls -l</a></span><br> '
+ '\u67E5\u770B\u6240\u6709\u6587\u7AE0\u7ED3\u6784\u8BF7\u4F7F\u7528 <span class="exec"><a href="javascript:void(0)" onclick="typeCommand(\'tree\')">tree</a></span><br>'
+ ' \u6E05\u9664\u5C4F\u5E55\u8BF7\u4F7F\u7528<span class="img"><a href="javascript:void(0)" onclick="typeCommand(\'clear\')">clear</a></span>\u6216\u8005CTRL+L<br><br>');
   this._terminal.write('\u652F\u6301\u4EE5\u4E0B\u547D\u4EE4:<br>');
   for (var c in this._terminal.commands) {
      if (this._terminal.commands.hasOwnProperty(c) && !c.startswith('_'))
         this._terminal.write(c + '  ');
   }
   cb();
}