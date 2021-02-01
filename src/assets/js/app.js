const GalleryClassName = 'gallery';
const GalleryDraggableClassName = 'gallery-draggable';
const GalleryLineClassName = 'gallery-line';
const GalleryLineContainerClassName = 'gallery-line-container';
const GallerySlideClassName = 'gallery-slide';
const GalleryDotClassName = 'gallery-dot';
const GalleryDotActiveClassName = 'gallery-dot-active';
const GalleryDotsClassName = 'gallery-dots';
const GalleryDotsActiveClassName = 'gallery-dot-active';
const GalleryNavClassName = 'gallery-nav';
const GalleryNavLeftClassName = 'gallery-nav-left';
const GalleryNavRightClassName = 'gallery-nav-right';
const GalleryNavDisabledClassName = 'gallery-nav-disabled';



class Gallery {
  constructor(element, options = {}) {
    this.containerNode = element;
    this.size = element.childElementCount;
    this.currentSlideWasChanged = false;
    this.settings = {
      margin: options.margin || 0,
      slidesToShow: options.slidesToShow,
      infinity: options.infinity,
      currentSlide: options.currentSlide
    }

    this.manageHTML = this.manageHTML.bind(this);
    this.setParameters = this.setParameters.bind(this);
    this.setEvents = this.setEvents.bind(this);
    this.resizeGallery = this.resizeGallery.bind(this);
    this.startDrag = this.startDrag.bind(this);
    this.stopDrag = this.stopDrag.bind(this);
    this.dragging = this.dragging.bind(this);
    this.setStylePosition = this.setStylePosition.bind(this);
    this.clickDots = this.clickDots.bind(this);
    this.moveToLeft = this.moveToLeft.bind(this);
    this.moveToRight = this.moveToRight.bind(this);
    this.changeCurrentSlide = this.changeCurrentSlide.bind(this);
    this.changeActiveDotClass = this.changeActiveDotClass.bind(this);
    this.changeDisabledNav = this.changeDisabledNav.bind(this);
    
    this.manageHTML();
    this.setParameters();
    this.setEvents();
  }
  manageHTML() {

    this.containerNode.classList.add(GalleryClassName); //gallery
    // gallery-line-container
    this.containerNode.innerHTML = `
        <div class="${GalleryLineContainerClassName}"> 
            <div class="${GalleryLineClassName}">
                ${this.containerNode.innerHTML}    
            </div>
        </div>
        <div class="${GalleryNavClassName}">
            <button class="${GalleryNavLeftClassName}">Left</button>
            <button class="${GalleryNavRightClassName}">Right</button>
        </div>
        <div class="${GalleryDotsClassName}"></div>
    `;
// gallery-line-container
    this.lineContainerNode = this.containerNode.querySelector(`.${GalleryLineContainerClassName}`);
    // gallery-line
    this.lineNode = this.containerNode.querySelector(`.${GalleryLineClassName}`);
    // gallery-dots
    this.dotsNode = this.containerNode.querySelector(`.${GalleryDotsClassName}`);

    this.slideNodes = Array.from(this.lineNode.children).map((childNode) =>
        wrapElementByDiv({
            element: childNode,
            className: GallerySlideClassName
        })
    );
    
    this.dotsNode.innerHTML = Array.from(Array(this.size).keys()).map((key) => (
        `<button class="${GalleryDotClassName} ${key === this.settings.currentSlide ? GalleryDotActiveClassName : ''}"></button>`
    )).join('');

    this.dotNodes = this.dotsNode.querySelectorAll(`.${GalleryDotClassName}`);
    this.navLeft = this.containerNode.querySelector(`.${GalleryNavLeftClassName}`);
    this.navRight = this.containerNode.querySelector(`.${GalleryNavRightClassName}`);

  }

  setParameters() {
    const coordsLineContainer = this.lineContainerNode.getBoundingClientRect();
    this.width = coordsLineContainer.width / this.settings.slidesToShow;
    this.maximumX = -(this.size - 1) * (this.width + this.settings.margin);
    this.x = -this.settings.currentSlide * (this.width + this.settings.margin);
    console.log('thiswidth- ', this.settings.currentSlide);
    this.resetStyleTransition();
    this.settings.margin = this.settings.margin * this.settings.slidesToShow;
    this.lineNode.style.width = `${this.size * (this.width + this.settings.margin)}px`;
    this.setStylePosition();
    this.changeActiveDotClass();
    this.changeDisabledNav();

    Array.from(this.slideNodes).forEach((slideNode) => {
        slideNode.style.width = `${this.width}px`;
        slideNode.style.marginRight = `${this.settings.margin}px`;
    });
  }

  setEvents() {
    this.debounceResizeGallery = debounce(this.resizeGallery);
    window.addEventListener('resize', this.debounceResizeGallery);
    this.lineNode.addEventListener('pointerdown', this.startDrag);
    window.addEventListener('pointerup', this.stopDrag);
    window.addEventListener('pointercancel', this.stopDrag);

    this.dotsNode.addEventListener('click', this.clickDots);
    this.navLeft.addEventListener('click', this.moveToLeft);
    this.navRight.addEventListener('click', this.moveToRight);
  }

  destroyEvents() {
    window.removeEventListener('resize', this.debounceResizeGallery);
    this.lineNode.removeEventListener('pointerdown', this.startDrag);
    window.removeEventListener('pointerup', this.stopDrag);
    window.removeEventListener('pointercancel', this.stopDrag);

    this.dotsNode.removeEventListener('click', this.clickDots);
    this.navLeft.removeEventListener('click', this.moveToLeft);
    this.navRight.removeEventListener('click', this.moveToRight);

  }

  resizeGallery() {
    this.setParameters();
  }

  startDrag(evt) {
    this.currentSlideWasChanged = false;
    this.clickX = evt.pageX;
    this.startX = this.x;

    this.resetStyleTransition();

    this.containerNode.classList.add(GalleryDraggableClassName);
    window.addEventListener('pointermove', this.dragging);

  }

  stopDrag() {
        window.removeEventListener('pointermove', this.dragging);

        this.containerNode.classList.remove(GalleryDraggableClassName);
        this.changeCurrentSlide();
    }

  dragging(evt) {
    this.dragX = evt.pageX;
    const dragShift = this.dragX -this.clickX;
    const easing = dragShift / 5;
    this.x = Math.max(Math.min(this.startX + dragShift, easing), this.maximumX + easing);

    this.setStylePosition();

    // Change active slide
    if (
        dragShift > 20 &&
        dragShift > 0 &&
        !this.currentSlideWasChanged &&
        this.settings.currentSlide > 0
    ) {
        this.currentSlideWasChanged = true;
        this.settings.currentSlide = this.settings.currentSlide - 1;
    }

    if (
        dragShift < -20 &&
        dragShift < 0 &&
        !this.currentSlideWasChanged &&
        this.settings.currentSlide < this.size - 1
    ) {
        this.currentSlideWasChanged = true;
        this.settings.currentSlide = this.settings.currentSlide + 1;
    }
  }

  clickDots(evt) {
    const dotNode = evt.target.closest('button');
    if (!dotNode) {
        return;
    }

    let dotNumber;
    for(let i = 0; i < this.dotNodes.length; i++) {
        if(this.dotNodes[i] === dotNode) {
            dotNumber = i;
            break;
        }
    }

    if (dotNumber === this.settings.currentSlide) {
        return;
    }

    const countSwipes = Math.abs(this.settings.currentSlide - dotNumber);
    this.settings.currentSlide = dotNumber;
    this.changeCurrentSlide(countSwipes);
  }

  moveToLeft() {
    if(this.settings.infinity) {
      if (this.settings.currentSlide === 0) {
        this.settings.currentSlide = this.slideToShow = 1 ? this.size - 1 : this.size - 2;
        this.changeCurrentSlide();
      } else {
        this.settings.currentSlide = this.settings.currentSlide - 1;
        this.changeCurrentSlide();
      }
    
    } else {
      if (this.settings.currentSlide <= 0) {
        return;
      } 
      this.settings.currentSlide = this.settings.currentSlide - 1;
      this.changeCurrentSlide();
      
    }
  }

  moveToRight() {
    if(this.settings.infinity) {
      if (this.settings.currentSlide == this.size - 1) {
        console.log('infinityrght = true');
        this.settings.currentSlide = 0;
        console.log('hiright')
        this.changeCurrentSlide();
      } else {
        this.settings.currentSlide = this.settings.currentSlide + 1;
        this.changeCurrentSlide();
      }
    
    } else {
      console.log('infinityright = false');
      if (this.settings.currentSlide >= this.size - 1) {
          return;
      }

      this.settings.currentSlide = this.settings.currentSlide + 1;
      this.changeCurrentSlide();
    }
  }

  changeCurrentSlide(countSwipes) {
    this.x = -this.settings.currentSlide * (this.width + this.settings.margin);
    this.setStyleTransition(countSwipes);
    this.setStylePosition();  
    this.changeActiveDotClass();
    this.changeDisabledNav()
  }

  changeActiveDotClass() {
    for(let i = 0; i < this.dotNodes.length; i++) {
        this.dotNodes[i].classList.remove(GalleryDotActiveClassName);
    }

    this.dotNodes[this.settings.currentSlide].classList.add(GalleryDotActiveClassName);
  }

  changeDisabledNav() {
    if (this.settings.currentSlide <= 0) {
      !this.settings.infinity ? this.navLeft.classList.add(GalleryNavDisabledClassName) : '';
        // this.navLeft.classList.add(GalleryNavDisabledClassName);
    } else {
        this.navLeft.classList.remove(GalleryNavDisabledClassName);
    }
    
    if (this.settings.currentSlide >= this.size - 1) {
      !this.settings.infinity ? this.navRight.classList.add(GalleryNavDisabledClassName) : '';
        // this.navRight.classList.add(GalleryNavDisabledClassName);
    } else {
        this.navRight.classList.remove(GalleryNavDisabledClassName);
    }
  }

  setStylePosition() {
    this.lineNode.style.transform = `translate3d(${this.x}px, 0, 0)`;
  }

  setStyleTransition(countSwipes = 1) {
    this.lineNode.style.transition = `all ${0.25 * countSwipes}s ease 0s`;
  }

  resetStyleTransition() {
    this.lineNode.style.transition = `all 0s ease 0s`;

  }
}

// Helpers
function wrapElementByDiv({element, className}) {
  const wrapperNode = document.createElement('div');
  wrapperNode.classList.add(className);

  element.parentNode.insertBefore(wrapperNode, element);
  wrapperNode.appendChild(element);

  return wrapperNode;
}

function debounce(func, time = 100) {
  let timer;
  return function (event) {
    clearTimeout(timer);
    timer = setTimeout(func, time, event);
  }
}


new Gallery(document.getElementById("gallery"), {
  margin: 10,
  slidesToShow : 1,
  infinity: false,
  currentSlide: 1
});
