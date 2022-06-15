window.LivewireUISlideover = () => {
    return {
        show: false,
        showActiveComponent: true,
        activeComponent: false,
        componentHistory: [],
        slideoverWidth: null ,
        getActiveComponentSlideoverAttribute(key) {
            if (this.$wire.get('components')[this.activeComponent] !== undefined) {
                return this.$wire.get('components')[this.activeComponent]['slideoverAttributes'][key];
            }
        },
        closeSlideoverOnEscape(trigger) {
            if (this.getActiveComponentSlideoverAttribute('closeOnEscape') === false) {
                return;
            }

            let force = this.getActiveComponentSlideoverAttribute('closeOnEscapeIsForceful') === true;
            this.closeSlideover(force);
        },
        closeSlideoverOnClickAway(trigger) {
            if (this.getActiveComponentSlideoverAttribute('closeOnClickAway') === false) {
                return;
            }

            this.closeSlideover(true);
        },
        closeSlideover(force = false, skipPreviousSlideovers = 0, destroySkipped = false) {
            if(this.show === false) {
                return;
            }

            if (this.getActiveComponentSlideoverAttribute('dispatchCloseEvent') === true) {
                const componentName = this.$wire.get('components')[this.activeComponent].name;
                Livewire.emit('slideoverClosed', componentName);
            }

            if (this.getActiveComponentSlideoverAttribute('destroyOnClose') === true) {
                Livewire.emit('destroyComponent', this.activeComponent);
            }

            if (skipPreviousSlideovers > 0) {
                for (var i = 0; i < skipPreviousSlideovers; i++) {
                    if (destroySkipped) {
                        const id = this.componentHistory[this.componentHistory.length - 1];
                        Livewire.emit('destroyComponent', id);
                    }
                    this.componentHistory.pop();
                }
            }

            const id = this.componentHistory.pop();

            if (id && force === false) {
                if (id) {
                    this.setActiveSlideoverComponent(id, true);
                } else {
                    this.setShowPropertyTo(false);
                }
            } else {
                this.setShowPropertyTo(false);
            }
        },
        setActiveSlideoverComponent(id, skip = false) {
            this.setShowPropertyTo(true);

            if (this.activeComponent === id) {
                return;
            }

            if (this.activeComponent !== false && skip === false) {
                this.componentHistory.push(this.activeComponent);
            }

            let focusableTimeout = 50;

            if (this.activeComponent === false) {
                this.activeComponent = id
                this.showActiveComponent = true;
                this.slideoverWidth = this.getActiveComponentSlideoverAttribute('maxWidthClass');
            } else {
                this.showActiveComponent = false;

                focusableTimeout = 400;

                setTimeout(() => {
                    this.activeComponent = id;
                    this.showActiveComponent = true;
                    this.slideoverWidth = this.getActiveComponentSlideoverAttribute('maxWidthClass');
                }, 300);
            }

            this.$nextTick(() => {
                let focusable = this.$refs[id]?.querySelector('[autofocus]');
                if (focusable) {
                    setTimeout(() => {
                        focusable.focus();
                    }, focusableTimeout);
                }
            });
        },
        focusables() {
            let selector = 'a, button, input, textarea, select, details, [tabindex]:not([tabindex=\'-1\'])'

            return [...this.$el.querySelectorAll(selector)]
                .filter(el => !el.hasAttribute('disabled'))
        },
        firstFocusable() {
            return this.focusables()[0]
        },
        lastFocusable() {
            return this.focusables().slice(-1)[0]
        },
        nextFocusable() {
            return this.focusables()[this.nextFocusableIndex()] || this.firstFocusable()
        },
        prevFocusable() {
            return this.focusables()[this.prevFocusableIndex()] || this.lastFocusable()
        },
        nextFocusableIndex() {
            return (this.focusables().indexOf(document.activeElement) + 1) % (this.focusables().length + 1)
        },
        prevFocusableIndex() {
            return Math.max(0, this.focusables().indexOf(document.activeElement)) - 1
        },
        setShowPropertyTo(show) {
            this.show = show;

            if (show) {
                document.body.classList.add('overflow-y-hidden');
            } else {
                document.body.classList.remove('overflow-y-hidden');

                setTimeout(() => {
                    this.activeComponent = false;
                    this.$wire.resetState();
                }, 300);
            }
        },
        init() {
            this.slideoverWidth = this.getActiveComponentSlideoverAttribute('maxWidthClass');

            Livewire.on('closeSlideover', (force = false, skipPreviousSlideovers = 0, destroySkipped = false) => {
                this.closeSlideover(force, skipPreviousSlideovers, destroySkipped);
            });

            Livewire.on('activeSlideoverComponentChanged', (id) => {
                this.setActiveSlideoverComponent(id);
            });
        }
    };
}
