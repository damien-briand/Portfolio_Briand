import { Vector2 } from "three";

/**
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

const DotScreenShader = {
	name: "DotScreenShader",

	uniforms: {
		tDiffuse: { value: null },
		tSize: { value: new Vector2(256, 256) },
		center: { value: new Vector2(0.5, 0.5) },
		angle: { value: 1.57 },
		scale: { value: 1.0 },
	},

	vertexShader: /* glsl */ `

        varying vec2 vUv;

        void main() {

            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

        }`,

	fragmentShader: /* glsl */ `

        uniform vec2 center;
        uniform float angle;
        uniform float scale;
        uniform vec2 tSize;

        uniform sampler2D tDiffuse;

        varying vec2 vUv;

        float pattern() {

            float s = sin( angle ), c = cos( angle );

            vec2 tex = vUv * tSize - center;
            vec2 point = vec2( c * tex.x - s * tex.y, s * tex.x + c * tex.y ) * scale;

            return ( sin( point.x ) * sin( point.y ) ) * 4.0;

        }

        void main() {

            vec4 color = texture2D( tDiffuse, vUv );

            float average = ( color.r + color.g + color.b ) / 3.0;
            float ColorR = color.r * 10.0 - 5.0 + pattern();
            float ColorG = color.g * 10.0 - 5.0 + pattern();
            float ColorB = color.b * 10.0 - 5.0 + pattern();

            gl_FragColor = vec4( vec3( ColorR, ColorG, ColorB), color.a );

        }`,
};

export { DotScreenShader };
