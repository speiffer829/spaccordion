# Spaccordion

## Setup
```bash
npm install spaccordion
```


### Minimum Markup
The outermost parent needs a class of `.spaccordion`. Within it are the two parts we will need: the `.spa_head` and the `.spa_content`. The head is the always visible part where the button lives and the content is the part that will be toggled.

Within `.spa_head` you need a button with an attribute of `aria-expanded="true|false"`.  This is what what spaccordion will attach the even listener to and is used to determine the state of the item. That means if you want it open by default then set this to `true`. FYI the button does not need to be a direct child of `.spa_head` it just needs to be in there somewhere.

Optionally within `.spa_head` you can have something with a class of `.spa_icon`.  This is meant for things like chevrons and all it does is rotate 180deg when the expanded state is true. This is optional and can go anywhere in `.spa_head` including the button.

`.spa_content` you can put pretty much whatever in there. I just wouldn't recommend doing any styling to the actual `.spa_content` div. if you need to style up the whole inside I would just wrap everything in another div and style that. Messing with things like display or sizing or even padding can mess everything up.

```html
<div id="spaccordion_id" class="spaccordion">
	<div class="spa_item">
		<div class="spa_head">
			<button aria-expanded="false">Button Text</button>
		</div>

		<div class="spa_content">
			<p>This will all be hidden until the button is clicked</p>
		</div>
	</div>
</div>
```


### Init With JS
Just copy this code and add your own id or HTMLElement directly and you are off to the races.

```javascript
import Spaccordion from 'spaccordion'

const my_spaccordion = new Spaccordion(`#spaccordion_id`)
```

## Options
You can add an optional options object as a second argument if you so choose.
```javascript
import Spaccordion from 'spaccordion'

const my_spaccordion = new Spaccordion(`#spaccordion_id`, {
	break_above: 1000,
	break_below: 300,
	duration: 500,
	auto_close: true,
	classes: {
		head: 'new-head',
		content: 'new-content',
		item: 'new-item',
		icon: 'new-icon'
	}
})
```

### Options
| Option | Type |  Description | Default Value |
| --- | ----------- | ------- | -- |
| break_above | `number` | When given a value it will destroy the spaccordion if the window gets wider than that number | `null`
| break_below | `number` | Same as break_above but it goes the other way. duh | `null`
duration | `number` | The speed in milliseconds the animation will take | `300`
auto_close | `boolean` | If set to `true`, spaccordion will automatically close any other open items when a new item is expanded. | `false`
classes | `object` | each required class can be changed in case of conflicts or personal preference. You can change one or all or whatever you want. You do you. | 
