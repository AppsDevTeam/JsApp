
// Function example:
/*

 (function (window, $) {
 window.app.register('foo', function ($el, options) {
 this.$el = $el;

 }, {
 availableCommands: [
 'foo',
 ],

 foo: function(param) {
 },
 });
 }(window, jQuery));

 */


(function (window, $) {

	App = function () {};

	App.prototype = {

		/**
		 * Register new component
		 *
		 * @param string name
		 * @param Class constructor
		 * @param Object prototype
		 */
		register: function (name, constructor, prototype) {

			if (this.registeredComponents[name] !== undefined) {
				throw new Error("Component '" + name + "' is already registered!");
			}

			// Assure that the component contructor inherits from App.prototype.componentPrototype
			constructor.prototype = $.extend({}, this.componentPrototype, prototype || constructor.prototype || {});

			this.registeredComponents[name] = constructor;
		},

		/**
		 * Get component constructor by component name.
		 * @param string name
		 * @return Class
		 */
		getRegisteredConstructor: function (name) {

			if (this.registeredComponents[name] === undefined) {
				throw new Error("Component '" + name + "' is not registered!");
			}

			return this.registeredComponents[name];
		},



		/**
		 * @param object options
		 */
		setOptions(options) {
			this.options = options;
		},

		/**
		 *
		 * @param string name
		 * @param mixed value
		 */
		setOption(name, value) {
			this.options[name] = value;
		},

		/**
		 *
		 * @param string name
		 * @return mixed
		 */
		getOption(name) {
			return this.options[name];
		},


		////////////////////////////////////////////////////////////////////////////
		// Protected funtions

		registeredComponents: {},


		componentPrototype: {
			availableCommands: [],

			commandCanBeIterated: function (command, params) {
				if (this.prototype.availableCommands.indexOf(command) === -1)
					return;	// contructor

				return params !== undefined;	// setters can be iterated
			},
		},

		options: {},

	};

	window.app = new App;



	$.fn.extend({
		c: function (componentName, command) {
			var args = Array.prototype.slice.call(arguments);

			var constructor = window.app.getRegisteredConstructor(componentName);
			var commandCanBeIterated = constructor.prototype.commandCanBeIterated.apply(constructor, args.slice(1));

			if (commandCanBeIterated === true || commandCanBeIterated === false) {
				// setter
				// getter

				var out = undefined;
				this.each(function () {
					var $elem = $(this);
					out = $elem.data('c')[componentName][command].apply(
									$elem.data('c')[componentName],
									args.slice(2)
									);
					return commandCanBeIterated;
				});
				return commandCanBeIterated
								? this	// setter
								: out;	// getter

			} else {
				// constructor

				return this.each(function () {
					var $elem = $(this);
					var data = $elem.data('c') || {};

					var constructorParams = args.slice(1);
					constructorParams.unshift($elem);
					constructorParams.unshift(null);

					if (data[componentName] !== undefined) {
						var e = new Error("Komponenta '" + componentName + "' je již na prvku " + $elem + " inicializována!");
						console.log(e, $elem);
						throw e;
					}

					// Use of .apply() with 'new' operator.
					// http://stackoverflow.com/a/8843181/4837606
					data[componentName] = new (Function.prototype.bind.apply(
									constructor,
									constructorParams
									));
					$elem.data('c', data);
				});
			}

		}
	});

})(window, jQuery);
