/**
 * @typedef Options
 * @prop {number} [break_above] - give it a number and it will stop being a accordion if viewport is wider than number
 * @prop {number} [break_below] - give it a number and it will stop being a accordion if viewport is thinner than number
 * @prop {number} [duration=300] - transition duration in milliseconds
 * @prop {boolean} [auto_close=false] - automatically close any other open drawers
 * @prop {Classes} [classes] - replace the default classes
 */

/**
 * @typedef Classes
 * @prop {string} [head] - replace the .spa_head class
 * @prop {string} [content] - replace the .spa_content class
 * @prop {string} [item] - replace the .spa_item class
 * @prop {string} [icon] - replace the .spa_icon class
 */

export default class Spaccordion {
	/**
	 * Create a spaccordion accordion.  In a addition to the root element you must have your HTML for each accordion item have a class of `.spa_item` around the whole item.
	 *
	 * Inside that there are two elements: `.spa_head` which is the always visible part where the button goes, and `.spa_content` where the hidden content will go. In the `spa_head` there must be a button with an `aria-expanded= true|false`. Inside that button you have the option to have something with  a class of `.spa_icon` which will be rotated 180deg when the accordion is open. Add it to a chevron or something.
	 * @param {string | HTMLElement} target - the parent element that should encompass the whole thing. Can be an HTMLElement or a string that can be used to document.querySelector
	 * @param {Options} [options] - Options for this accordion
	 */
	constructor(
		target,
		{
			break_above = null,
			break_below = null,
			duration = 300,
			auto_close = false,
			classes = {},
		} = {}
	) {
		if (!(target instanceof HTMLElement)) {
			if (!document.querySelector(target)) return
			target = document.querySelector(target)
		}

		const default_classes = {
			head: 'spa_head',
			content: 'spa_content',
			item: 'spa_item',
			icon: 'spa_icon',
		}

		classes = { ...default_classes, ...classes }

		this.target = target
		this.options = {
			duration,
			break_above,
			break_below,
			auto_close,
			classes,
		}

		this.spa_items = target.querySelectorAll(`.${classes.item}`)

		// Make sure there are items
		if (this.spa_items.length === 0) {
			console.error(
				`You are missing a minimum of 1 .${classes.item} inside your target`
			)
		}

		check_breakpoints()

		window.addEventListener('resize', check_breakpoints)

		function check_breakpoints() {
			const window_width = window.innerWidth
			let is_disabled
			if (break_above !== null && window_width >= break_above) {
				is_disabled = 'true'
			} else if (break_below !== null && window_width <= break_below) {
				is_disabled = 'true'
			} else {
				is_disabled = 'false'
			}

			target.querySelectorAll(`.${classes.item}`).forEach((item) => {
				//Check for markup Failures
				if (!item.querySelector(`.${classes.head}`)) {
					console.error(
						`You are missing a .${classes.head} inside your .spa_item`
					)
				}

				if (!item.querySelector(`.${classes.head} button[aria-expanded]`)) {
					console.error(
						'You are missing a button with aria-expanded in your .spa_head'
					)
				}

				if (!item.querySelector(`.${classes.content}`)) {
					console.error('You are missing a .spa_content inside your .spa_item')
				}

				item.setAttribute('data-is-disabled', is_disabled)
			})
		}

		this.spa_items.forEach((item) => {
			const toggle_btn = item.querySelector(
				`.${classes.head} button[aria-expanded]`
			)

			const current_content = item.querySelector(`.${classes.content}`)
			const starting_expanded_status = toggle_btn.ariaExpanded || 'false'

			//Set some data attributes
			item.setAttribute('data-expanded', starting_expanded_status)

			// Create a wrapper around content so it can be shrunk without worry of padding issues
			const wrapper = document.createElement('div') // Create wrapper div
			// Add a class and the data-expanded attribute. give it the .spa_content value or false if there is none
			wrapper.classList.add('spa_content_wrapper')
			wrapper.setAttribute('data-expanded', starting_expanded_status)
			wrapper.setAttribute('data-unfurled', starting_expanded_status)

			// Generate a unique ID for the wrapper
			const wrapper_id = `spa_content_wrapper_${Math.random()
				.toString(36)
				.substr(2, 9)}`
			wrapper.id = wrapper_id

			wrapper.style.transitionDuration = `${this.options.duration || 300}ms`

			// Add the wrapper around the current content
			current_content.parentNode.insertBefore(wrapper, current_content)
			wrapper.appendChild(current_content)

			//Add the other aira attributes to the button
			toggle_btn.setAttribute('aria-controls', wrapper.id)
			toggle_btn.id = `${wrapper.id}_btn`

			//Add the other aria attributes to the wrapper
			wrapper.setAttribute('aria-labelledby', toggle_btn.id)
			wrapper.role = 'region'

			//Add Event listener to button
			toggle_btn.addEventListener('click', (e) => handle_toggle(e, item))
		})

		const handle_toggle = (e, item) => {
			e.preventDefault()
			const new_value = item.dataset.expanded === 'true' ? 'false' : 'true'
			if (new_value === 'true') {
				this.open_accordion(item)
			} else {
				this.close_accordion(item)
			}
		}

		this.style_all()
	}

	open_accordion(item) {
		const toggle_btn = item.querySelector(
			`.${this.options.classes.head} button[aria-expanded]`
		)
		const content_wrapper = item.querySelector('.spa_content_wrapper')

		//If auto collapse is on then we handle that here
		if (this.options.auto_close) {
			const all_open = this.target.querySelectorAll(
				`.${this.options.classes.item}[data-expanded=true]`
			)
			all_open.forEach((item) => {
				this.close_accordion(item)
			})
		}

		item.setAttribute('data-expanded', 'true')
		toggle_btn.setAttribute('aria-expanded', 'true')
		content_wrapper.setAttribute('data-expanded', 'true')
		window.requestAnimationFrame(() => {})
		content_wrapper.setAttribute('data-unfurled', 'true')

		const end_height = content_wrapper.getBoundingClientRect().height

		const isReduced =
			window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
			window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true

		if (!!isReduced) return
		// FLIP animation from height 0px to auto
		const anim = content_wrapper.animate(
			[{ height: '0px' }, { height: `${end_height}px` }],
			{
				duration: this.options.duration || 300,
				easing: 'ease-in-out',
				fill: 'both',
			}
		)

		// After the animation is done, remove the animation styles
		anim.onfinish = () => {
			anim.cancel()
		}
	}

	close_accordion(item) {
		const toggle_btn = item.querySelector(
			`.${this.options.classes.head} button[aria-expanded]`
		)
		const content_wrapper = item.querySelector('.spa_content_wrapper')
		const start_height = content_wrapper.getBoundingClientRect().height
		item.setAttribute('data-expanded', 'false')
		toggle_btn.setAttribute('aria-expanded', 'false')
		content_wrapper.setAttribute('data-unfurled', 'false')
		content_wrapper.setAttribute('data-expanded', 'false')

		const isReduced =
			window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
			window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true

		if (!!isReduced) return

		// FLIP animation from height auto to 0px
		const anim = content_wrapper.animate(
			[{ height: `${start_height}px` }, { height: '0px' }],
			{
				duration: this.options.duration || 300,
				easing: 'ease-in-out',
				fill: 'both',
			}
		)

		// After the animation is done, remove the animation styles
		anim.onfinish = () => {
			anim.cancel()
		}
	}

	close_all() {
		const all_open = this.target.querySelectorAll(
			`.${this.options.classes.item}[data-expanded=true]`
		)
		all_open.forEach((item) => {
			this.close_accordion(item)
		})
	}

	open_all() {
		const all_open = this.target.querySelectorAll(
			`.${this.options.classes.item}[data-expanded=false]`
		)
		all_open.forEach((item) => {
			this.open_accordion(item)
		})
	}

	style_all() {
		const style_tag = document.createElement('style')
		style_tag.type = 'text/css'
		style_tag.id = 'spaccordion_styles'
		const new_styles = `
.${this.options.classes.item}[data-is-disabled='true'] button[aria-expanded] {
	pointer-events: none;
}

.${this.options.classes.icon}{
	transition: rotate ${this.options.duration || 300}ms;
}

@media (prefers-reduced-motion: reduce) {
	.${this.options.classes.icon}{
		transition: rotate 0ms;
	}
}

[aria-expanded=true] .${this.options.classes.icon}{
	rotate: 180deg;
}

.${this.options.classes.item}[data-is-disabled='false'] .spa_content_wrapper {
	overflow: hidden;
}

.${
			this.options.classes.item
		}[data-is-disabled='false']	.spa_content_wrapper[data-expanded='false'] {
	height: 0;
}

.${
			this.options.classes.item
		}[data-is-disabled='false']	.spa_content_wrapper[data-expanded='true'] {
	height: auto;
}
		`
		style_tag.innerHTML = new_styles
		document.getElementsByTagName('head')[0].appendChild(style_tag)
	}
}
