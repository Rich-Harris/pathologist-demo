/*global module, require */
var gobble = require( 'gobble' );

module.exports = gobble([
	gobble( 'src/files' )
		.transform( 'replace', { version: require( 'pathologist/package.json' ).version }),

	// vendor
	gobble([
		'node_modules/pathologist/dist/pathologist.umd.js',
		'node_modules/ractive/ractive.runtime.js',

		gobble( 'node_modules/codemirror' )
			.include([
				'lib/**',
				'mode/xml/**',
				'addon/fold/foldcode.js',
				'addon/fold/foldgutter.js',
				'addon/fold/xml-fold.js'
			])
			.moveTo( 'codemirror' )
	]).moveTo( 'vendor' ),

	// app
	gobble( 'src/app' )
		.transform( 'rollup', {
			entry: 'main.js',
			dest: 'app.js',
			format: 'iife',
			external: [ 'ractive', 'pathologist' ],
			plugins: [
				require( 'rollup-plugin-string' )({ include: '**/*.svg' }),
				require( 'rollup-plugin-ractive' )(),
				require( 'rollup-plugin-buble' )(),
				require( 'rollup-plugin-node-resolve' )({
					module: true,
					jsnext: true
				})
			]
		}),

	gobble( 'src/styles' )
		.transform( 'postcss', {
			src: 'index.css',
			dest: 'min.css',
			plugins: [
				require( 'postcss-import' ),
				require( 'autoprefixer' ),
				require( 'postcss-nested' ),
				require( 'postcss-clearfix' )
				//require( 'cssnano' ) // commenting out until we can figure out how to disable z-index rebasing
			],
			map: true
		})

// minify on deploy, but don't bother in development
]).transformIf( gobble.env() === 'production', 'uglifyjs' );
