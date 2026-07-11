export function initSectionSwipers(): void {
  if (!window.Swiper) return;

  const services = document.querySelector<HTMLElement>('.services-swiper');
  if (services) {
    new window.Swiper(services, {
      slidesPerView: 1,
      spaceBetween: 24,
      loop: true,
      pagination: { el: services.querySelector('.swiper-pagination'), clickable: true },
      breakpoints: { 640: { slidesPerView: 2 }, 992: { slidesPerView: 3 } },
    });
  }
}
