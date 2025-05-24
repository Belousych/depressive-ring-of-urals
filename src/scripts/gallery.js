document.addEventListener('DOMContentLoaded', () => {
  const swiperWrapper = document.querySelector('.swiper-wrapper');
 
  let swiper;







  // Инициализация Swiper
  swiper = new Swiper('.swiper', {
    loop: false,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
  });
});
