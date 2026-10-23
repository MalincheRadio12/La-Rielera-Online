if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch((error) => {
        console.log('Error al registrar el Service Worker:', error);
      });
  }
  
  /* ============================================================ */
  /* ====== SCRIPT PRINCIPAL - LA RIELERA ONLINE ====== */
  /* ============================================================ */
  
  // Espera a que el DOM esté completamente cargado antes de ejecutar
  document.addEventListener('DOMContentLoaded', function() {
      
    /* ============================================================ */
    /* ====== 1. REFERENCIAS A ELEMENTOS DEL DOM ====== */
    /* ============================================================ */
    
    // --- Tema oscuro / claro ---
    const themeToggle = document.getElementById('theme-toggle');
    const logoImg = document.getElementById('logo-img');
    
    // --- Reproductor de radio ---
    const radioStream = document.getElementById('radio-stream');
    const playBtn = document.getElementById('play-btn');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const currentSong = document.getElementById('current-song');
    const playInstruction = document.getElementById('play-instruction');
    
    // --- Visor de noticias ---
    const newsViewer = document.getElementById('news-viewer');
    const refreshNewsBtn = document.getElementById('refresh-news');
    
    // --- Carrusel principal ---
    const mainCarouselSlides = document.getElementById('main-carousel-slides');
    const mainPrevBtn = document.getElementById('main-prev-btn');
    const mainNextBtn = document.getElementById('main-next-btn');
    const mainIndicators = document.getElementById('main-carousel-indicators');
    
    /* ============================================================ */
    /* ====== 2. MODO OSCURO / CLARO ====== */
    /* ============================================================ */
    
    /**
     * Alterna entre el modo oscuro y claro
     * Guarda la preferencia en localStorage para persistencia
     */
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('darkMode', 'enabled');
            // La imagen del logo se mantiene igual
            logoImg.src = 'imagenes/503244390_122108838188886842_101-Photoroom.png';
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('darkMode', 'disabled');
            logoImg.src = 'imagenes/503244390_122108838188886842_101-Photoroom.png';
        }
    }
    
    // Cargar preferencia guardada al iniciar
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
        logoImg.src = 'imagenes/503244390_122108838188886842_101-Photoroom.png';
    }
    
    themeToggle.addEventListener('click', toggleDarkMode);
    
    /* ============================================================ */
    /* ====== 3. REPRODUCTOR DE RADIO ====== */
    /* ============================================================ */
    
    /**
     * Alterna entre reproducir y pausar el stream de audio
     */
    function togglePlay() {
        if (radioStream.paused) {
            radioStream.play()
                .then(() => {
                    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                    currentSong.textContent = 'La mejor música para ti';
                    playInstruction.innerHTML = ''; // Oculta el botón de manual
                })
                .catch(e => {
                    console.log('Error al reproducir:', e);
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    showManualPlayButton();
                });
        } else {
            radioStream.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }
    
    /**
     * Alterna el silencio (mute) del reproductor
     */
    function toggleMute() {
        radioStream.muted = !radioStream.muted;
        muteBtn.innerHTML = radioStream.muted ? 
            '<i class="fas fa-volume-mute"></i>' : 
            '<i class="fas fa-volume-up"></i>';
    }
    
    /**
     * Ajusta el volumen según el valor del slider
     */
    function setVolume() {
        radioStream.volume = volumeSlider.value;
        if (radioStream.volume === 0) {
            muteBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else {
            muteBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }
    
    /**
     * Muestra un botón para activar la reproducción manualmente
     * (útil cuando el autoplay está bloqueado por el navegador)
     */
    function showManualPlayButton() {
        playInstruction.innerHTML = `
            <button class="manual-play-btn" onclick="initAutoplay()">
                <i class="fas fa-play"></i> Haz clic para reproducir la transmisión
            </button>
        `;
    }
    
    // Configurar volumen inicial
    radioStream.volume = volumeSlider.value;
    
    // --- Event listeners del reproductor ---
    playBtn.addEventListener('click', togglePlay);
    muteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', setVolume);
    
    /**
     * Función global para iniciar el autoplay
     * Puede ser llamada desde el botón manual o desde eventos de interacción
     */
    window.initAutoplay = function() {
        radioStream.play()
            .then(() => {
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
                currentSong.textContent = 'La mejor música para ti';
                playInstruction.innerHTML = '';
            })
            .catch(e => {
                console.log('Autoplay bloqueado:', e);
                showManualPlayButton();
            });
    };
    
    /**
     * Intenta autoplay al primer clic/interacción del usuario
     * (Los navegadores modernos requieren interacción del usuario para reproducir audio)
     */
    function handleFirstInteraction() {
        initAutoplay();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
    }
    
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    
    /* ============================================================ */
    /* ====== 4. VISOR DE NOTICIAS ====== */
    /* ============================================================ */
    
    /**
     * Recarga el iframe de noticias
     */
    refreshNewsBtn.addEventListener('click', function() {
        newsViewer.src = newsViewer.src; // Recarga la misma URL
    });
    
    /* ============================================================ */
  /* ====== 5. CARRUSEL PRINCIPAL (INFINITO - LEE DEL HTML) ====== */
  /* ============================================================ */
  
  // Variables de estado del carrusel
  let mainCurrentIndex = 0;
  let mainSlidesCount = 0;
  let mainVisibleSlides = 5;
  let mainAutoPlayInterval = null;
  let mainSlides = [];
  let mainOriginalSlides = [];
  let mainTotalOriginal = 0;
  
  /**
   * Inicializa el carrusel con las imágenes del HTML
   * Duplica las imágenes para crear el efecto infinito
   */
  function initMainCarousel() {
      const container = document.getElementById('main-carousel-slides');
      const indicatorsContainer = document.getElementById('main-carousel-indicators');
      
      // Guardar los slides originales (los del HTML)
      mainOriginalSlides = Array.from(container.querySelectorAll('.carousel-slide'));
      mainTotalOriginal = mainOriginalSlides.length;
      
      // Si no hay imágenes, mostrar un mensaje
      if (mainTotalOriginal === 0) {
          container.innerHTML = '<div class="carousel-slide"><p style="text-align:center;padding:20px;">No hay publicidad disponible</p></div>';
          return;
      }
      
      // Limpiar contenedor
      container.innerHTML = '';
      indicatorsContainer.innerHTML = '';
      
      // Clonar las imágenes para efecto infinito (3 veces)
      const clones = 3;
      for (let c = 0; c < clones; c++) {
          for (let i = 0; i < mainTotalOriginal; i++) {
              // Clonar el slide original
              const originalSlide = mainOriginalSlides[i];
              const clone = originalSlide.cloneNode(true);
              container.appendChild(clone);
          }
      }
      
      // Guardar referencia a todos los slides
      mainSlides = container.querySelectorAll('.carousel-slide');
      mainSlidesCount = mainSlides.length;
      
      // Crear indicadores (solo para las imágenes originales)
      for (let i = 0; i < mainTotalOriginal; i++) {
          const indicator = document.createElement('div');
          indicator.classList.add('carousel-indicator');
          if (i === 0) indicator.classList.add('active');
          indicator.dataset.index = i;
          indicator.addEventListener('click', () => {
              // Ir al slide correspondiente en el conjunto original
              const targetIndex = i + Math.floor((mainSlidesCount / 3) * 0.5);
              mainCurrentIndex = targetIndex;
              updateMainCarousel(true);
              resetAutoPlay();
          });
          indicatorsContainer.appendChild(indicator);
      }
      
      // Establecer posición inicial en el centro (para tener clones a ambos lados)
      mainCurrentIndex = Math.floor((mainSlidesCount / 3) * 0.5);
      
      // Actualizar carrusel
      updateMainCarousel(true);
      
      // Iniciar auto-play
      startAutoPlay();
  }
  
  /**
   * Actualiza la posición del carrusel
   * @param {boolean} instant - Si es true, no usa animación
   */
  function updateMainCarousel(instant = false) {
      const container = document.getElementById('main-carousel-slides');
      const totalOriginal = mainTotalOriginal;
      
      // Si no hay slides, salir
      if (mainSlidesCount === 0) return;
      
      // Calcular el ancho de cada slide (porcentaje)
      mainVisibleSlides = window.innerWidth >= 768 ? 5 : 1;
      const slideWidth = 100 / mainVisibleSlides;
      
      // Aplicar transición
      if (instant) {
          container.style.transition = 'none';
      } else {
          container.style.transition = 'transform 0.5s ease';
      }
      
      // Mover el carrusel
      container.style.transform = `translateX(-${mainCurrentIndex * slideWidth}%)`;
      
      // Actualizar indicadores (basado en la posición actual)
      const indicators = document.querySelectorAll('.carousel-indicator');
      if (indicators.length > 0 && totalOriginal > 0) {
          const currentRealIndex = mainCurrentIndex % totalOriginal;
          indicators.forEach((indicator, index) => {
              indicator.classList.toggle('active', index === currentRealIndex);
          });
      }
      
      // Verificar si necesitamos hacer un salto instantáneo (efecto infinito)
      if (!instant) {
          const totalSlides = mainSlidesCount;
          const halfClones = Math.floor(totalSlides / 3);
          
          // Si estamos al final del conjunto, saltar al inicio de los clones
          if (mainCurrentIndex >= totalSlides - mainVisibleSlides) {
              setTimeout(() => {
                  container.style.transition = 'none';
                  const jumpBack = totalSlides - (halfClones * 2);
                  mainCurrentIndex = mainCurrentIndex - jumpBack;
                  container.style.transform = `translateX(-${mainCurrentIndex * slideWidth}%)`;
                  // Forzar reflow
                  container.offsetHeight;
              }, 500);
          }
          // Si estamos al inicio del conjunto, saltar al final de los clones
          else if (mainCurrentIndex < mainVisibleSlides - 1) {
              setTimeout(() => {
                  container.style.transition = 'none';
                  const jumpForward = totalSlides - (halfClones * 2);
                  mainCurrentIndex = mainCurrentIndex + jumpForward;
                  container.style.transform = `translateX(-${mainCurrentIndex * slideWidth}%)`;
                  // Forzar reflow
                  container.offsetHeight;
              }, 500);
          }
      }
  }
  
  /**
   * Inicia el auto-play del carrusel
   */
  function startAutoPlay() {
      if (mainAutoPlayInterval) {
          clearInterval(mainAutoPlayInterval);
      }
      
      mainAutoPlayInterval = setInterval(() => {
          mainCurrentIndex += 1;
          updateMainCarousel(false);
      }, 3000);
  }
  
  /**
   * Detiene el auto-play del carrusel
   */
  function stopAutoPlay() {
      if (mainAutoPlayInterval) {
          clearInterval(mainAutoPlayInterval);
          mainAutoPlayInterval = null;
      }
  }
  
  /**
   * Reinicia el auto-play (detener y empezar de nuevo)
   */
  function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
  }
  
  // --- Eventos del carrusel ---
  document.getElementById('main-prev-btn').addEventListener('click', () => {
      stopAutoPlay();
      mainCurrentIndex -= 1;
      updateMainCarousel(false);
      startAutoPlay();
  });
  
  document.getElementById('main-next-btn').addEventListener('click', () => {
      stopAutoPlay();
      mainCurrentIndex += 1;
      updateMainCarousel(false);
      startAutoPlay();
  });
  
  // --- Inicializar carrusel ---
  initMainCarousel();
  
  /**
   * Actualizar carrusel al redimensionar la ventana
   */
  window.addEventListener('resize', () => {
      updateMainCarousel(true);
  });
  
  /**
   * Si se agregan nuevas imágenes dinámicamente, se puede reinicializar
   * Ejemplo: si quieres agregar publicidad con JavaScript
   */
  function refreshCarousel() {
      stopAutoPlay();
      initMainCarousel();
  }
  
    /* ============================================================ */
  /* ====== 6. ANIMACIÓN DE CARGA DEL TÍTULO ====== */
  /* ============================================================ */
  
  /**
   * Efecto de carga para el título "PROGRAMACIÓN"
   * Los puntos se animan en bucle infinito
   */
  (function() {
    const puntos = document.querySelectorAll('.punto');
    let activo = 0;
    
    // Opcional: puedes detener la animación después de unos segundos
    // o dejarla siempre activa (como está ahora)
    
    // Si quieres que la animación sea más dinámica,
    // puedes agregar un evento hover para acelerar
    const titulo = document.querySelector('.programacion-titulo');
    if (titulo) {
        titulo.addEventListener('mouseenter', () => {
            puntos.forEach((p, i) => {
                p.style.animationDuration = '0.6s';
                p.style.animationDelay = `${i * 0.1}s`;
            });
        });
        
        titulo.addEventListener('mouseleave', () => {
            puntos.forEach((p, i) => {
                p.style.animationDuration = '1.4s';
                p.style.animationDelay = `${i * 0.2}s`;
            });
        });
    }
  })();
    
    /* ============================================================ */
    /* ====== FIN DEL SCRIPT ====== */
    /* ============================================================ */
  });
  
  /* ============================================================ */
  /* ====== 7. BANNER HERO / BIENVENIDA ====== */
  /* ============================================================ */
  
  (function() {
      const heroSlides = document.querySelectorAll('.hero-slide');
      const heroDots = document.querySelectorAll('.hero-dot');
      const heroPrev = document.getElementById('hero-prev');
      const heroNext = document.getElementById('hero-next');
      let heroCurrentIndex = 0;
      let heroInterval = null;
      const HERO_INTERVAL_TIME = 4000; // 4 segundos
  
      /**
       * Cambia al slide especificado
       */
      function goToHeroSlide(index) {
          // Remover clase active de todos los slides y dots
          heroSlides.forEach(slide => slide.classList.remove('active'));
          heroDots.forEach(dot => dot.classList.remove('active'));
          
          // Activar el slide y dot correspondiente
          heroSlides[index].classList.add('active');
          heroDots[index].classList.add('active');
          
          heroCurrentIndex = index;
      }
  
      /**
       * Avanza al siguiente slide
       */
      function nextHeroSlide() {
          let nextIndex = (heroCurrentIndex + 1) % heroSlides.length;
          goToHeroSlide(nextIndex);
      }
  
      /**
       * Retrocede al slide anterior
       */
      function prevHeroSlide() {
          let prevIndex = (heroCurrentIndex - 1 + heroSlides.length) % heroSlides.length;
          goToHeroSlide(prevIndex);
      }
  
      /**
       * Inicia el auto-play del banner
       */
      function startHeroAutoPlay() {
          if (heroInterval) {
              clearInterval(heroInterval);
          }
          heroInterval = setInterval(nextHeroSlide, HERO_INTERVAL_TIME);
      }
  
      /**
       * Detiene el auto-play del banner
       */
      function stopHeroAutoPlay() {
          if (heroInterval) {
              clearInterval(heroInterval);
              heroInterval = null;
          }
      }
  
      /**
       * Reinicia el auto-play
       */
      function resetHeroAutoPlay() {
          stopHeroAutoPlay();
          startHeroAutoPlay();
      }
  
      // --- Eventos ---
      
      // Dots (indicadores)
      heroDots.forEach((dot, index) => {
          dot.addEventListener('click', () => {
              stopHeroAutoPlay();
              goToHeroSlide(index);
              startHeroAutoPlay();
          });
      });
  
      // Flechas
      if (heroNext) {
          heroNext.addEventListener('click', () => {
              stopHeroAutoPlay();
              nextHeroSlide();
              startHeroAutoPlay();
          });
      }
  
      if (heroPrev) {
          heroPrev.addEventListener('click', () => {
              stopHeroAutoPlay();
              prevHeroSlide();
              startHeroAutoPlay();
          });
      }
  
      // Pausar al pasar el mouse
      const heroBanner = document.querySelector('.hero-banner');
      if (heroBanner) {
          heroBanner.addEventListener('mouseenter', stopHeroAutoPlay);
          heroBanner.addEventListener('mouseleave', startHeroAutoPlay);
      }
  
      // Iniciar auto-play
      startHeroAutoPlay();
  
  })();
