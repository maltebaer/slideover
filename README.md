<p align="center">
<a href="https://github.com/maltebaer/slideover/actions"><img src="https://github.com/maltebaer/slideover/workflows/PHPUnit/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/maltebaer/slideover"><img src="https://img.shields.io/packagist/dt/maltebaer/slideover" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/livewire-ui/slideover"><img src="https://img.shields.io/packagist/dt/livewire-ui/slideover" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/maltebaer/slideover"><img src="https://img.shields.io/packagist/v/maltebaer/slideover" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/maltebaer/slideover"><img src="https://img.shields.io/packagist/l/maltebaer/slideover" alt="License"></a>
</p>

## About Wire Elements Slideover
Wire Elements Slideover is a Livewire component that provides you with a slideover that supports multiple child slideovers while maintaining state.

## Installation

<a href="https://philo.dev/laravel-slideovers-with-livewire/"><img src="https://d.pr/i/GR66B3+" alt=""></a>

Click the image above to read a full article on using the Wire Elements slideover package or follow the instructions below.

To get started, require the package via Composer:

```
composer require maltebaer/slideover
```

## Livewire directive
Add the Livewire directive `@livewire('livewire-ui-slideover')` directive to your template.
```html
<html>
<body>
    <!-- content -->

    @livewire('livewire-ui-slideover')
</body>
</html>
```

## Alpine
Livewire Elements Slideover requires [Alpine](https://github.com/alpinejs/alpine). You can use the official CDN to quickly include Alpine:

```html
<!-- Alpine v2 -->
<script src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js" defer></script>

<!-- Alpine v3 -->
<script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

## TailwindCSS
The base slideover is made with TailwindCSS. If you use a different CSS framework I recommend that you publish the slideover template and change the markup to include the required classes for your CSS framework.
```shell
php artisan vendor:publish --tag=livewire-ui-slideover-views
```


## Creating a slideover
You can run `php artisan make:livewire EditUser` to make the initial Livewire component. Open your component class and make sure it extends the `SlideoverComponent` class:

```php
<?php

namespace App\Http\Livewire;

use LivewireUI\Slideover\SlideoverComponent;

class EditUser extends SlideoverComponent
{
    public function render()
    {
        return view('livewire.edit-user');
    }
}
```

## Opening a slideover
To open a slideover you will need to emit an event. To open the `EditUser` slideover for example:

```html
<!-- Outside of any Livewire component -->
<button onclick="Livewire.emit('openSlideover', 'edit-user')">Edit User</button>

<!-- Inside existing Livewire component -->
<button wire:click="$emit('openSlideover', 'edit-user')">Edit User</button>

<!-- Taking namespace into account for component Admin/Actions/EditUser -->
<button wire:click="$emit('openSlideover', 'admin.actions.edit-user')">Edit User</button>
```

## Passing parameters
To open the `EditUser` slideover for a specific user we can pass the user id (notice the single quotes):

```html
<!-- Outside of any Livewire component -->
<button onclick='Livewire.emit("openSlideover", "edit-user", {{ json_encode(["user" => $user->id]) }})'>Edit User</button>

<!-- Inside existing Livewire component -->
<button wire:click='$emit("openSlideover", "edit-user", {{ json_encode(["user" => $user->id]) }})'>Edit User</button>

<!-- If you use a different primaryKey (e.g. email), adjust accordingly -->
<button wire:click='$emit("openSlideover", "edit-user", {{ json_encode(["user" => $user->email]) }})'>Edit User</button>

<!-- Example of passing multiple parameters -->
<button wire:click='$emit("openSlideover", "edit-user", {{ json_encode([$user->id, $isAdmin]) }})'>Edit User</button>
```

The parameters are passed to the `mount` method on the slideover component:

```php
<?php

namespace App\Http\Livewire;

use App\Models\User;
use LivewireUI\Slideover\SlideoverComponent;

class EditUser extends SlideoverComponent
{
    public User $user;

    public function mount(User $user)
    {
        Gate::authorize('update', $user);

        $this->user = $user;
    }

    public function render()
    {
        return view('livewire.edit-user');
    }
}
```

## Opening a child slideover
From an existing slideover you can use the exact same event and a child slideover will be created:

```html
<!-- Edit User Slideover -->

<!-- Edit Form -->

<button wire:click='$emit("openSlideover", "delete-user", {{ json_encode(["user" => $user->id]) }})'>Delete User</button>
```

## Closing a (child) slideover
If for example a user clicks the 'Delete' button which will open a confirm dialog, you can cancel the deletion and return to the edit user slideover by emitting the `closeSlideover` event. This will open the previous slideover. If there is no previous slideover the entire slideover component is closed and the state will be reset.
```html
<button wire:click="$emit('closeSlideover')">No, do not delete</button>
```

You can also close a slideover from within your slideover component class:

```php
<?php

namespace App\Http\Livewire;

use App\Models\User;
use LivewireUI\Slideover\SlideoverComponent;

class EditUser extends SlideoverComponent
{
    public User $user;

    public function mount(User $user)
    {
        Gate::authorize('update', $user);

        $this->user = $user;
    }

    public function update()
    {
        Gate::authorize('update', $user);

        $this->user->update($data);

        $this->closeSlideover();
    }

    public function render()
    {
        return view('livewire.edit-user');
    }
}
```

If you don't want to go to the previous slideover but close the entire slideover component you can use the `forceClose` method:

```php
public function update()
{
    Gate::authorize('update', $user);

    $this->user->update($data);

    $this->forceClose()->closeSlideover();
}
```

Often you will want to update other Livewire components when changes have been made. For example, the user overview when a user is updated. You can use the `closeSlideoverWithEvents` method to achieve this.

```php
public function update()
{
    Gate::authorize('update', $user);

    $this->user->update($data);

    $this->closeSlideoverWithEvents([
        UserOverview::getName() => 'userModified',
    ]);
}
```

It's also possible to add parameters to your events:

```php
public function update()
{
    $this->user->update($data);

    $this->closeSlideoverWithEvents([
        UserOverview::getName() => ['userModified', [$this->user->id],
    ]);
}
```

## Changing slideover properties

You can change the width (default value '2xl') of the slideover by overriding the static `slideoverMaxWidth` method in your slideover component class:

```php
/**
 * Supported: 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'
 */
public static function slideoverMaxWidth(): string
{
    return 'xl';
}
```

By default, the slideover will close when you hit the `escape` key. If you want to disable this behavior to, for example, prevent accidentally closing the slideover you can overwrite the static `closeSlideoverOnEscape` method and have it return `false`.
```php
public static function closeSlideoverOnEscape(): bool
{
    return false;
}
```

By default, the slideover will close when you click outside the slideover. If you want to disable this behavior to, for example, prevent accidentally closing the slideover you can overwrite the static `closeSlideoverOnClickAway` method and have it return `false`.
 ```php
 public static function closeSlideoverOnClickAway(): bool
 {
     return false;
 }
 ```

 By default, closing a slideover by pressing the escape key will force close all slideovers. If you want to disable this behavior to, for example, allow pressing escape to show a previous slideover, you can overwrite the static `closeSlideoverOnEscapeIsForceful` method and have it return `false`.
 ```php
 public static function closeSlideoverOnEscapeIsForceful(): bool
 {
     return false;
 }
 ```

 When a slideover is closed, you can optionally enable a `slideoverClosed` event to be fired. This event will be fired on a call to `closeSlideover`, when the escape button is pressed, or when you click outside the slideover. The name of the closed component will be provided as a parameter;
 ```php
 public static function dispatchCloseEvent(): bool
 {
     return true;
 }
 ```

 By default, when a child slideover is closed, the closed components state is still available if the same slideover component is opened again. If you would like to destroy the component when its closed you can override the static `destroyOnClose` method and have it return `true`. When a destroyed slideover is opened again its state will be reset.
 ```php
 public static function destroyOnClose(): bool
 {
     return true;
 }
 ```

## Skipping previous slideovers
In some cases you might want to skip previous slideovers. For example:
1. Team overview slideover
2. -> Edit Team
3. -> Delete Team

In this case, when a team is deleted, you don't want to go back to step 2 but go back to the overview.
You can use the `skipPreviousSlideover` method to achieve this. By default it will skip the previous slideover. If you want to skip more you can pass the number of slideovers to skip `skipPreviousSlideovers(2)`.

```php
<?php

namespace App\Http\Livewire;

use App\Models\Team;
use LivewireUI\Slideover\SlideoverComponent;

class DeleteTeam extends SlideoverComponent
{
    public Team $team;

    public function mount(Team $team)
    {
        $this->team = $team;
    }

    public function delete()
    {
        Gate::authorize('delete', $this->team);

        $this->team->delete();

        $this->skipPreviousSlideover()->closeSlideoverWithEvents([
            TeamOverview::getName() => 'teamDeleted'
        ]);
    }

    public function render()
    {
        return view('livewire.delete-team');
    }
}
```

You can also optionally call the `destroySkippedSlideovers()` method to destroy the skipped slideovers so if any are opened again their state will be reset





## Building Tailwind CSS for production
To purge the classes used by the package, add the following lines to your purge array in `tailwind.config.js`:
```js
'./vendor/maltebaer/slideover/resources/views/*.blade.php',
'./storage/framework/views/*.php',
```

Because some classes are dynamically build you should add some classes to the purge safelist so your `tailwind.config.js` should look something like this:
```js
module.exports = {
  purge: {
    content: [
      './vendor/maltebaer/slideover/resources/views/*.blade.php',
      './storage/framework/views/*.php',
      './resources/views/**/*.blade.php',
    ],
    options: {
      safelist: [
        'sm:max-w-2xl'
      ]
    }
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
```

## Configuration
You can customize the Slideover via the `livewire-ui-slideover.php` config file. This includes some additional options like including CSS if you don't use TailwindCSS for your application, as well as the default slideover properties.

 To publish the config run the vendor:publish command:
```shell
php artisan vendor:publish --tag=livewire-ui-slideover-config
```

```php
<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Include CSS
    |--------------------------------------------------------------------------
    |
    | The slideover uses TailwindCSS, if you don't use TailwindCSS you will need
    | to set this parameter to true. This includes the modern-normalize css.
    |
    */
    'include_css' => false,


    /*
    |--------------------------------------------------------------------------
    | Include JS
    |--------------------------------------------------------------------------
    |
    | Livewire UI will inject the required Javascript in your blade template.
    | If you want to bundle the required Javascript you can set this to false
    | and add `require('vendor/maltebaer/slideover/resources/js/slideover');`
    | to your script bundler like webpack.
    |
    */
    'include_js' => true,


    /*
    |--------------------------------------------------------------------------
    | Slideover Component Defaults
    |--------------------------------------------------------------------------
    |
    | Configure the default properties for a slideover component.
    |
    | Supported slideover_max_width
    | 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl'
    */
    'component_defaults' => [
        'slideover_max_width' => '2xl',

        'close_slideover_on_click_away' => true,

        'close_slideover_on_escape' => true,

        'close_slideover_on_escape_is_forceful' => true,

        'dispatch_close_event' => false,

        'destroy_on_close' => false,
    ],
];
```

## Security
If you are new to Livewire I recommend to take a look at the [security details](https://laravel-livewire.com/docs/2.x/security). In short, it's **very important** to validate all information given Livewire stores this information on the client-side, or in other words, this data can be manipulated. Like shown in the examples above, use the `Gate` facade to authorize actions.

## Credits
- [Philo Hermans](https://github.com/philoNL)
- [All Contributors](../../contributors)

## License
WireElements is open-sourced software licensed under the [MIT license](LICENSE.md).

## Beautiful components crafted with Livewire

<a href="https://maltebaer.dev/"><img src="https://philo.dev/content/images/size/w1000/2022/05/maltebaer-pro.png" width="600" alt="" /></a>

<a href="https://maltebaer.dev/">Sign up to get notified</a>
