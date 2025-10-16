// I made a modified version of this:
// https://www.bram.us/2020/01/10/smooth-scrolling-sticky-scrollspy-navigation/
window.addEventListener('custom-content-loaded', () => {

  let activeElement = null;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const navElement = document.querySelector(`nav li a[href="#${id}"]`)
      if (entry.isIntersecting) {
        if (activeElement && activeElement !== navElement) {
          activeElement.parentElement.classList.remove('active');
        }
        navElement.parentElement.classList.add('active');
        activeElement = navElement;
      }
    });
  });

  // Track all headers that have an `id` applied
  document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
    .forEach((header) => {
      observer.observe(header);
    });

  // add padding above sections when jumped to
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();

      // Scroll to the target element with an offset
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      window.scrollTo({
        top: targetElement.offsetTop - 150,
        behavior: 'smooth'
      });
    });
  });
});
