<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Animal_Giggles_Router {

	/**
	 * Initialize router hooks.
	 *
	 * @return void
	 */
	public function init() {
		add_action( 'init', array( $this, 'register_rewrite_rules' ) );
		add_filter( 'query_vars', array( $this, 'register_query_vars' ) );
		add_action( 'template_redirect', array( $this, 'handle_animal_share_route' ) );
		add_filter( 'redirect_canonical', array( $this, 'maybe_disable_canonical_redirect' ), 10, 2 );
	}

	/**
	 * Register rewrite rules for share URLs.
	 *
	 * URL format:
	 * /head/body/butt/productId
	 *
	 * @return void
	 */
	public function register_rewrite_rules() {
		$front_page_id = (int) get_option( 'page_on_front' );

		if ( $front_page_id <= 0 ) {
			return;
		}

		add_rewrite_rule(
			'^([^/]+)/([^/]+)/([^/]+)/([^/]+)/?$',
			'index.php?page_id=' . $front_page_id . '&ag_head=$matches[1]&ag_body=$matches[2]&ag_butt=$matches[3]&ag_product_id=$matches[4]',
			'top'
		);
	}

	/**
	 * Register custom query vars.
	 *
	 * @param array $vars Query vars.
	 * @return array
	 */
	public function register_query_vars( $vars ) {
		$vars[] = 'ag_head';
		$vars[] = 'ag_body';
		$vars[] = 'ag_butt';
		$vars[] = 'ag_product_id';

		return $vars;
	}

	/**
 * Disable WordPress canonical redirect for animal share routes.
 *
 * @param string|false $redirect_url The redirect URL.
 * @param string       $requested_url The requested URL.
 * @return string|false
 */
public function maybe_disable_canonical_redirect( $redirect_url, $requested_url ) {
	$head       = get_query_var( 'ag_head' );
	$body       = get_query_var( 'ag_body' );
	$butt       = get_query_var( 'ag_butt' );
	$product_id = get_query_var( 'ag_product_id' );

	if ( $head || $body || $butt || $product_id ) {
		return false;
	}

	return $redirect_url;
}

	/**
	 * Handle incoming animal share routes.
	 *
	 * - If no custom route is present, do nothing.
	 * - If route is incomplete/invalid, redirect home.
	 * - If ProductId exists but head/body/butt do not match, redirect to canonical URL.
	 *
	 * @return void
	 */
	public function handle_animal_share_route() {
	global $wpdb;

	$head       = get_query_var( 'ag_head' );
	$body       = get_query_var( 'ag_body' );
	$butt       = get_query_var( 'ag_butt' );
	$product_id = get_query_var( 'ag_product_id' );

	if ( ! $head && ! $body && ! $butt && ! $product_id ) {
		return;
	}

	if ( ! $head || ! $body || ! $butt || ! $product_id ) {
		wp_safe_redirect( home_url( '/' ) );
		exit;
	}

	if ( 'not-found' === $product_id ) {
		return;
	}

	$row = $wpdb->get_row(
		$wpdb->prepare(
			"SELECT ImageHead, ImageBody, ImageButt, ProductId FROM images WHERE ProductId = %s LIMIT 1",
			$product_id
		),
		ARRAY_A
	);

	if ( ! $row ) {
		wp_safe_redirect( home_url( '/' ) );
		exit;
	}

	$db_head = strtolower( trim( (string) $row['ImageHead'] ) );
	$db_body = strtolower( trim( (string) $row['ImageBody'] ) );
	$db_butt = strtolower( trim( (string) $row['ImageButt'] ) );

	if ( '' === $db_butt && '' !== $db_body ) {
		$db_butt = $db_body;
	}

	$request_head = strtolower( trim( (string) $head ) );
	$request_body = strtolower( trim( (string) $body ) );
	$request_butt = strtolower( trim( (string) $butt ) );

	if ( $request_head !== $db_head || $request_body !== $db_body || $request_butt !== $db_butt ) {
		$canonical_url = home_url(
			sprintf(
				'/%s/%s/%s/%s',
				rawurlencode( $db_head ),
				rawurlencode( $db_body ),
				rawurlencode( $db_butt ),
				rawurlencode( (string) $row['ProductId'] )
			)
		);

		wp_safe_redirect( $canonical_url );
		exit;
	}
}

}