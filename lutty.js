var Lutty = {

    /**
     * This function is used to initialize all ttys in the document.
     * @return Boolean - returns true||false.
    */
    init: function() {
        self = this;

        var ttys = document.querySelectorAll('.lutty');
        for (var i = 0; i < ttys.length; i++) {
            this.tty = ttys[i];

            this.editor_prefix = ElemenTailor.create('div', {
                type: 'text',
                style: `width: auto;
                       float: left;
                       padding-right: 4px;
                       `,
                innerHTML: `[` + self.meta.dir + `]$`
            });

            this.editor = ElemenTailor.create('input', {
                type: 'text',
                style: `background-color: black;
                        outline: none;
                        border: none;
                        color: yellow;
                        display: block;
                        width: 100%;
                        float: right;
                       `,
                autofocus: true   
            });

            this.cmd_history = ElemenTailor.create('pre', {
                type: 'text',
                style: `width: 100%;
                       `
            });    

            this.terminal = ElemenTailor.create('div',
                    {
                        class: 'tty-terminal',
                        style: `background-color: black;
                                color: white;
                                width: 100%;
                                height: 100%;
                                overflow-y: scroll;
                                `,
                        childs: [
                            this.cmd_history,
                            ElemenTailor.create('div', {
                                style: `display: flex;`,
                                childs: [
                                    this.editor_prefix,
                                    this.editor
                                ]
                            })
                        ]
                    }
                    );

            this.tty.parentNode.appendChild(this.terminal);
            ElemenTailor.delete(this.tty);



            this.editor.addEventListener('keydown', function (e) {
                if (e.keyCode == 13) {
                   Lutty.execute(this.value); 
                }
            });
        }
        
        
        function e0() {
            Lutty.execute('echo BOOTING...');

            setTimeout(eA, 2500);
        }

        function eA() {
            Lutty.execute('echo GOING_INTO_BIN_FOLDER...');
            Lutty.execute('cd ~/usr/bin');

            setTimeout(eB, 1000);
        }
        

        function eB() {
            Lutty.execute('echo COMPRESSING_FILESYSTEM...');
            Lutty.execute('echo JSON.stringify(Lutty.fs); > fs');

            setTimeout(eC, 1000);
        }

        function eC() {
            Lutty.execute('echo GOING_BACK...');
            Lutty.execute('cd');

            setTimeout(eD, 1000);
        }

        function eD() {
            Lutty.execute('echo EXECUTING...');
            Lutty.execute('fs');

            setTimeout(eF, 1000);
        }

        function eF() {
            Lutty.execute('echo DONE.');
        }

        e0();

        return true;
    },

    execute: function (command) {
        var command_original = command;
        var command = command.split(' ');
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
            var func = Lutty.fs['~']['usr']['bin'][command_name];
            if (typeof(func) == 'function') {
                var output = Lutty.fs['~']['usr']['bin'][command_name](args);
            } else {
                if (func != undefined) {
                    if ('__content__' in func) {
                        var output = eval(func['__content__']);
                    }
                } else {
                     var output = 'Command not found';
                }
            }

        } catch (e) { var output = e; }

        Lutty.cmd_history.appendChild(ElemenTailor.create('div', {
            innerHTML: command_original,
            style: `width: 100%;
                    color: yellow;
                       `
        }));
        
        if (output != undefined) {
            Lutty.cmd_history.appendChild(ElemenTailor.create('div', {
                innerHTML: output,
                style: `width: 100%;
                        color: white;
                       `
            }));
        }
        Lutty.editor.value = '';
        Lutty.editor_prefix.innerHTML = `[` + self.meta.dir + `]$`;
        Lutty.editor.setAttribute('autofocus', true);
        Lutty.terminal.scrollTop = Lutty.terminal.scrollHeight;
    },

    fs: {
        '~': {
            usr: {
                bin: {
                    ls: function (args) {
                        if (args != null) {
                            var dir = args[0];
                            if (!args[0].startsWith('~')) {
                                dir = self.meta.dir + '/' + dir;
                            }
                        } else {
                            var dir = self.meta.dir;    
                        }
                        
                        var ls_dir = Lutty.get_dir(dir);
                        output = Object.keys(ls_dir).join(" ");
                        
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
                            
                            var absolute_dir = Lutty.get_dir(dir);

                            if (absolute_dir['__content__'] != undefined) {
                                return 'Cannot cd into file.';
                            }

                            self.meta.dir = dir;
                        } else if (dir == '..') {
                            if (self.meta.dir != '~') {
                                var subdirs = self.meta.dir.split('/');
                                subdirs.pop(subdirs.length-1);
                                if (!Array.isArray(subdirs)) { subdirs = [subdirs]; }
                                self.meta.dir = subdirs.join('/');
                            }
                        } else {
                            tmp_dir = self.meta.dir + '/' + dir;
                            
                            var relative_dir = Lutty.get_dir(tmp_dir);
                            
                            if (relative_dir['__content__'] != undefined) {
                                return 'Cannot cd into file.';
                            }

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
                            var dir = self.meta.dir;
                        }

                        var mk_dir = Lutty.get_dir(dir);

                        mk_dir[dirname] = {}
                    },

                    touch: function (args, content='') {
                        if (args == null) {
                            return 'You must choose a filename';
                        } else {
                            filename = args[0];
                        }

                        var current_dir = Lutty.get_dir(self.meta.dir);

                        current_dir[filename] = {
                            __content__: content
                        }
                    },

                    echo: function (args) {
                        if (args == null) {
                            return '';
                        } else {
                            var ech = args[0];

                            if (args[1] == '>') {
                                var filename = args[2];
                                this.touch([filename], ech);
                            } else {
                                return ech;
                            }
                        }
                    },

                    more: function (args) {
                        if (args == null) {
                            return 'Cannot read empty';
                        } else {
                            var dir = args[0];
                            if (!dir.startsWith('~')) {
                                dir = self.meta.dir + '/' + dir;
                            }
                        }
                        
                        var more_dir = Lutty.get_dir(dir);

                        if (more_dir['__content__'] == undefined) {
                            return 'Not a file';
                        }
                        return more_dir['__content__']
                    },

                    bash: function(args) {
                        if (args == null) {
                            return 'Unable to execute void.';
                        } else {
                            filename = args[0];
                        }

                        var current_dir = Lutty.get_dir(self.meta.dir);
                            
                        return eval(current_dir[filename]['__content__']);
                    }
                },

            },
            etc: {},
            dev: {},
            opt: {},
            var: {
                log: {}
            },
            tmp: {}
        }
    },

    get_dir: function(dirname) {
        var dir = dirname;
        var subdirs = dir.split('/');
        var prev_dir = null;
        for (var i = 0; i < subdirs.length; i++) {
            if (prev_dir == null) {
                prev_dir = self.fs[subdirs[i]];
            } else {
                prev_dir = prev_dir[subdirs[i]];
            }
        }

        return prev_dir;
    },

    meta: {
        dir: '~'
    }

};


if (typeof module !== 'undefined' && module.exports) {
    module.lutty = Lutty;
}
