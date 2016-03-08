var Lutty = {

    /**
     * This function is used to initialize all ttys in the document.
     * @return Boolean - returns true||false.
    */
    init: function() {
        var ttys = document.querySelectorAll('.lutty');
        console.log(ttys);

        return true;
    }
};


if (typeof module !== 'undefined' && module.exports) {
    module.lutty = Lutty;
}
