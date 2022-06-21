<div>
    @isset($jsPath)
        <script>
            {!! file_get_contents($jsPath) !!}
        </script>
    @endisset
    @isset($cssPath)
        <style>
            {!! file_get_contents($cssPath) !!}
        </style>
    @endisset

    <div
        x-data="LivewireUISlideover()"
        x-init="init()"
        x-on:click="closeSlideoverOnClickAway()"
        x-on:close.stop="setShowPropertyTo(false)"
        x-on:keydown.escape.window="closeSlideoverOnEscape()"
        x-on:keydown.tab.prevent="$event.shiftKey || nextFocusable().focus()"
        x-on:keydown.shift.tab.prevent="prevFocusable().focus()"
        x-show="show"
        class="relative z-10"
        style="display: none;"
        aria-labelledby="slide-over-title"
        role="dialog"
        aria-modal="true"
    >
        <!-- Background backdrop -->
        <div
            x-show="show"
            x-transition:enter="transition-opacity ease-linear duration-300"
            x-transition:enter-start="opacity-0"
            x-transition:enter-end="opacity-100"
            x-transition:leave="transition-opacity ease-linear duration-300"
            x-transition:leave-start="opacity-100"
            x-transition:leave-end="opacity-0"
            class="fixed inset-0 bg-gray-600 bg-opacity-75"
        ></div>

        <div class="fixed inset-0 overflow-hidden">
            <div class="absolute inset-0 overflow-hidden">
                <div class="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none sm:pl-16">
                    <div
                        @click.outside="show = false"
                        id="slideover-container"
                        x-show="show && showActiveComponent"
                        x-transition:enter="transform transition ease-in-out duration-500 sm:duration-700"
                        x-transition:enter-start="translate-x-full"
                        x-transition:enter-end="translate-x-0"
                        x-transition:leave="transform transition ease-in-out duration-500 sm:duration-700"
                        x-transition:leave-start="translate-x-0"
                        x-transition:leave-end="translate-x-full"
                        x-bind:class="slideoverWidth"
                        class="w-screen pointer-events-auto"
                    >
                        @forelse($components as $id => $component)
                            <div
                                x-show.immediate="activeComponent == '{{ $id }}'"
                                x-ref="{{ $id }}"
                                wire:key="{{ $id }}"
                                class="h-full"
                            >
                                @livewire($component['name'], $component['attributes'], key($id))
                            </div>
                        @empty
                        @endforelse
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
