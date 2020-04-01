/**
 * External dependencies
 */
import { isEqual } from 'lodash';

/**
 * Internal dependencies
 */
import { getRTL } from '../utils/rtl';

export const DIRECTION = {
	UP: 'up',
	DOWN: 'down',
	LEFT: 'left',
	RIGHT: 'right',
};

export const BASE_ALIGNMENTS = [
	[ 'top', 'left' ],
	[ 'top', 'center' ],
	[ 'top', 'right' ],
	[ 'center', 'left' ],
	[ 'center', 'center' ],
	[ 'center', 'right' ],
	[ 'bottom', 'left' ],
	[ 'bottom', 'center' ],
	[ 'bottom', 'right' ],
];

export const ALIGNMENTS = BASE_ALIGNMENTS.map( transformAlignment );
export const ALIGNMENT_VALUES = ALIGNMENTS.map( ( a ) => a.join( ' ' ) );
export const ALIGNMENT_MATRIX = [
	[ 0, 1, 2 ],
	[ 3, 4, 5 ],
	[ 6, 7, 8 ],
];

export const ALIGNMENT_GRID_SIZE = 3;

/**
 * Transforms an alignment value to an [x, y] alignment data.
 *
 * @param {Array|string} alignments Value to transform.
 *
 * @return {Array} The [x, y] alignment array, if applicable.
 */
export function transformAlignment( alignments = [] ) {
	let value = alignments;

	if ( typeof alignments === 'string' ) {
		value = alignments.split( / |-/g );
	}

	if ( ! Array.isArray( value ) ) {
		value = [];
	}

	value = value
		.map( ( v ) => v.toLowerCase() )
		// Supports remapping of 'middle' to 'center'
		.map( ( v ) => v.replace( 'middle', 'center' ) )
		// Flips for RTL
		.map( transformAlignmentRTL );

	// Handles cases were only 'center' or ['center'] is provided
	if ( value.length === 1 && value[ 0 ] === 'center' ) {
		value.push( 'center' );
	}

	return value.sort();
}
/**
 * Transforms alignment values to respect RTL.
 *
 * @param {string} value The alignment value to transform.
 *
 * @return {string} The flipped alignment value (if RTL).
 */
function transformAlignmentRTL( value ) {
	const isRTL = getRTL();
	const token = '$TMP';

	if ( ! isRTL ) return value;

	return (
		value
			// Temporarily swap left for token
			.replace( 'left', token )
			.replace( 'right', 'left' )
			// Swap tokenized left for actual value
			.replace( token, 'right' )
	);
}

/**
 * Checks if a value is a valid alignment.
 *
 * @param {string} alignment Value to check.
 *
 * @return {boolean} Whether alignment is valid.
 */
export function isAlignmentValid( alignment = 'center' ) {
	const match = getAlignmentValues( alignment );

	return !! match;
}

/**
 * Retrieves a matching alignment [x, y] data from a value.
 *
 * @param {string} alignment Value to check.
 *
 * @return {Array} Matching alignment data.
 */
export function getAlignmentValues( alignment = 'center' ) {
	const values = transformAlignment( alignment );

	if ( values.length > 2 ) {
		return undefined;
	}

	const match = ALIGNMENTS.find( ( a ) => isEqual( values, a ) );

	return match;
}

/**
 * Retrieves the [x, y] alignment data index from a value.
 *
 * @param {string} alignment Value to check.
 *
 * @return {number} The index of a matching alignment.
 */
export function getAlignmentIndex( alignment = 'center' ) {
	const item = getAlignmentValues( alignment );
	const index = ALIGNMENTS.indexOf( item );

	return index > -1 ? index : undefined;
}

/**
 * Retrieves the alignment value from an index.
 *
 * @param {number} index An alignment index.
 *
 * @return {string} The alignment value
 */
export function getAlignmentValueFromIndex( index = 0 ) {
	const align = ALIGNMENTS[ index ] || [];

	return align.join( ' ' );
}

/**
 * Retrieves the [x, y] coordinates from the alignment matrix from an index.
 *
 * @param {number} index The index to reference.
 *
 * @return {Array<number, number>} The [x, y] coordinates.
 */
export function getCoordsFromIndex( index = 0 ) {
	const coords = [ 0, 0 ];

	ALIGNMENT_MATRIX.forEach( ( xv, x ) => {
		xv.forEach( ( v, y ) => {
			if ( v === index ) {
				coords[ 0 ] = x;
				coords[ 1 ] = y;
			}
		} );
	} );

	return coords;
}

/**
 * Retrieves the alignment index given an [x, y] alignment matrix coordinate.
 *
 * @param {Array<number, number>} coords The [x, y] matrix coordinates.
 * @param {number} fallback The fallback index.
 *
 * @return {number} The index given a [x, y] coordinate.
 */
export function getIndexFromCoords( coords, fallback = 0 ) {
	const [ x, y ] = coords;
	const exists =
		ALIGNMENT_MATRIX[ x ] !== undefined &&
		ALIGNMENT_MATRIX[ x ][ y ] !== undefined;

	return exists ? ALIGNMENT_MATRIX[ x ][ y ] : fallback;
}

/**
 * Retrieves the next alignment index, given a direction movement.
 *
 * @param {number} currentIndex The current index to start from.
 * @param {string} direction The movement direction.
 *
 * @return {number} The next alignment index.
 */
export function getNextIndexFromDirection( currentIndex, direction ) {
	if ( ! direction ) return currentIndex;

	const [ x, y ] = getCoordsFromIndex( currentIndex );
	let moveX = x;
	let moveY = y;

	switch ( direction ) {
		case DIRECTION.UP:
			moveX = x - 1;
			break;
		case DIRECTION.DOWN:
			moveX = x + 1;
			break;
		case DIRECTION.LEFT:
			moveY = y - 1;
			break;
		case DIRECTION.RIGHT:
			moveY = y + 1;
			break;
		default:
			break;
	}

	return getIndexFromCoords( [ moveX, moveY ], currentIndex );
}

export function mapAlignmentToGrid( { alignment = ALIGNMENTS, id } ) {
	const gridSize = ALIGNMENT_GRID_SIZE;
	const grid = [];

	alignment.forEach( ( values, index ) => {
		if ( index % gridSize === 0 ) {
			grid.push( [] );
		}
		const currentRow = grid[ grid.length - 1 ];

		currentRow.push( {
			values,
			index,
			id: `${ id }-${ index }`,
		} );
	} );

	return grid;
}

export function getAlignIndexFromGrid( grid, id ) {
	const flatGrid = [];

	grid.forEach( ( row ) => {
		row.forEach( ( cell ) => {
			flatGrid.push( cell );
		} );
	} );

	const cell = flatGrid.find( ( item ) => item.id === id );

	return cell ? cell.index : undefined;
}
