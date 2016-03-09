var Lutty = {

    /**
     * This function is used to initialize all ttys in the document.
     * @return Boolean - returns true||false.
    */
    init: function() {
        self = this;

        var ttys = document.querySelectorAll('.lutty');
        for (var i = 0; i < ttys.length; i++) {
            var tty = ttys[i];

            var editor_prefix = ElemenTailor.create('div', {
                type: 'text',
                style: `width: auto;
                       float: left;
                       padding-right: 4px;
                       `,
                innerHTML: `[` + self.meta.dir + `]$`
            });

            var editor = ElemenTailor.create('input', {
                type: 'text',
                style: `background-color: black;
                        outline: none;
                        border: none;
                        color: yellow;
                        display: block;
                        width: 100%;
                        float: right;
                       `
            });

            var cmd_history = ElemenTailor.create('div', {
                type: 'text',
                style: `width: 100%;
                       `
            });    

            var terminal = ElemenTailor.create('div',
                    {
                        class: 'tty-terminal',
                        style: `background-color: black;
                                color: white;
                                width: 100%;
                                height: 100%;
                                overflow: scroll;
                                `,
                        childs: [
                            cmd_history,
                            ElemenTailor.create('div', {
                                style: `display: flex;`,
                                childs: [
                                    editor_prefix,
                                    editor
                                ]
                            })
                        ]
                    }
                    );

            tty.parentNode.appendChild(terminal);
            ElemenTailor.delete(tty);



            editor.addEventListener('keydown', function (e) {
                if (e.keyCode == 13) {
                    var command = editor.value.split(' ');
                    var command_name = command[0];
                    if (command.length > 1) {
                        var args = command;
                        args.shift();
                        console.log(args);

                        if (!Array.isArray(args)) { args = [args]; }
                    } else {
                        var args = null;
                    }

                    try {
                    var output = self.fs()['~']['usr']['bin'][command_name](args);
                    } catch (e) { var output = e; }

                    cmd_history.appendChild(ElemenTailor.create('div', {
                        innerHTML: editor.value,
                        style: `width: 100%;
                                color: yellow;
                                   `
                    }));
                    
                    if (output != undefined) {
                        cmd_history.appendChild(ElemenTailor.create('div', {
                            innerHTML: output,
                            style: `width: 100%;
                                    color: white;
                                   `
                        }));
                    }
                    editor.value = '';
                    editor_prefix.innerHTML = `[` + self.meta.dir + `]$`;
                    terminal.scrollTop = terminal.scrollHeight;
                }
            });
        }

        return true;
    },


    fs: function () {
        self = this;

        return {
            '~': {
                usr: {
                    bin: {
                        ls: function (args) {
                            if (args == null) {
                                var dir = self.meta.dir;
                            } else {
                                dir = args[0];
                            }
                            var subdirs = dir.split('/');
                            
                            
                            var prev_dir = null;
                            for (var i = 0; i < subdirs.length; i++) {
                                if (prev_dir == null) {
                                    prev_dir = self.fs()[subdirs[i]];
                                } else {
                                    prev_dir = prev_dir[subdirs[i]];
                                }
                            }

                            output = Object.keys(prev_dir).join(" ");
                            
                            return output;
                        },

                        cd: function (args) {
                            if (args != null) {
                                var dir = args[0];
                                if (dir == '/') { dir = '~'; }
                            } else {
                                var dir = '~';
                            }
                            
                            if (dir.startsWith('~')) {
                                self.meta.dir = dir;
                            } else if (dir == '..') {
                                if (self.meta.dir != '~') {
                                    var subdirs = self.meta.dir.split('/');
                                    subdirs.pop(subdirs.length-1);
                                    if (!Array.isArray(subdirs)) { subdirs = [subdirs]; }
                                    self.meta.dir = subdirs.join('/');
                                }
                            } else {
                                self.meta.dir += '/' + dir;
                            }
                        },
                        
                        pwd: function (args) {
                            return self.meta.dir;
                        },

                        mkdir: function (args) {
                            if (args == null) {
                                return 'You must choose a dirname';
                            } else {
                                dirname = args[0];
                            }

                            var dir = self.meta.dir;
                            var subdirs = dir.split('/');
                            
                            var prev_dir = null;
                            for (var i = 0; i < subdirs.length; i++) {
                                if (prev_dir == null) {
                                    prev_dir = self.fs()[subdirs[i]];
                                } else {
                                    prev_dir = prev_dir[subdirs[i]];
                                }
                            }

                            prev_dir[dirname] = {}

                            return Object.keys(prev_dir);
                        },

                        more: function (args) {
                            if (args == null) {
                                return 'Cannot read empty';
                            } else {
                                file = args[0];
                            }
                            
                            if (!file.startsWith('~')) {
                                var dir = self.meta.dir;
                            } else {
                                var dir = file.split('/');
                                dir.pop(dir.length);
                                dir = dir.join('/');
                                var file = file.split('/')[file.split('/').length-1];
                            }
                            var subdirs = dir.split('/');
                            var prev_dir = null;
                            for (var i = 0; i < subdirs.length; i++) {
                                if (prev_dir == null) {
                                    prev_dir = self.fs()[subdirs[i]];
                                } else {
                                    prev_dir = prev_dir[subdirs[i]];
                                }
                            }
                            
                            if (prev_dir[file]['__content__'] == undefined) {
                                return 'Not a file';
                            }
                            return prev_dir[file]['__content__']
                        }
                    },

                },
                etc: {},
                dev: {},
                opt: {},
                var: {
                    log: {
                        'system.log': {
                            __content__: `This is just a log file`
                        },
                        'logfile.log': {
                            __content__: `[ERROR] @ line 93`
                        }
                    }
                },
            }
        }
    },

    meta: {
        dir: '~'
    }

};


if (typeof module !== 'undefined' && module.exports) {
    module.lutty = Lutty;
}
