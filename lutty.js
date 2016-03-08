var Lutty = {

    /**
     * This function is used to initialize all ttys in the document.
     * @return Boolean - returns true||false.
    */
    init: function() {
        var ttys = document.querySelectorAll('.lutty');
        for (var i = 0; i < ttys.length; i++) {
            var tty = ttys[i];
            var terminal = ElemenTailor.create('div', { class: 'tty-terminal' });

            tty.parentNode.appendChild(terminal);
            ElemenTailor.delete(tty);
        }

        return true;
    },


    filesystem: {
        'files': {
             '': {
                'files':{
                    'usr': {
                        'files': {
                            'bin': {
                                'files': {
                                    'ls' : {
                                        'executable': 'true',

                                    }
                                }
                            }
                        }
                    },
                    'dev': {'files': {}},
                    'etc': {'files': {}},
                    'opt': {'files': {}}
                },
            }
        }
    },

    meta: {
        'dir': ''
    },
        
    
    ls:function() {
        var filesystem = this.filesystem;
        var dir = this.meta['dir'];

        return filesystem['files'][dir];
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.lutty = Lutty;
}
