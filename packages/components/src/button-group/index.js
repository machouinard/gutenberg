/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { forwardRef } from '@wordpress/element';

function ButtonGroup( { className, ...props }, ref ) {
	const classes = classnames( 'components-button-group', className );

	return <div { ...props } className={ classes } ref={ ref } role="group" />;
}

export default forwardRef( ButtonGroup );
