<?php

namespace App\Repositories\Interfaces;

interface WishlistRepositoryInterface
{
    public function getUserWishlist();
    public function toggleWishlist(int $productId);
    public function removeFromWishlist(int $id);
    public function getWishlistCount();
}
