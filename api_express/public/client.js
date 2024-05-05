
$('#expandButton').on('click', function () {

    $('.sidebar').toggleClass('active');
    $('.pushable').toggleClass('pushed');


    setTimeout(() => {
        $('.pushable').on('click', function () {
            $('.pushable').unbind('click');

            $('.sidebar').toggleClass('active');
            $(this).toggleClass('pushed');
        });
    }, 0)

});


