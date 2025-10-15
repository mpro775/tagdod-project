### ملخص الفهارس لكل مجموعة (Collection)

- ملاحظة: هذا الملخص مستخرج من تعريفات الـ Schema في الـ Backend. يُنصح بمراجعته دوريًا بعد أي تغيير.

#### User
- phone (unique), isAdmin, createdAt, status, deletedAt, roles, مركبة: (phone,isAdmin), (status,deletedAt,createdAt)

#### Product
- نصي: name, description (full-text)
- categoryId+status+isActive, brandId+status, slug, status+isActive+order, isFeatured+status, isNew+status, isBestseller+status, deletedAt, createdAt, salesCount, viewsCount

#### Variant
- productId+isActive, sku (unique,sparse), price, stock, attributeValues.attributeId, attributeValues.valueId, deletedAt, productId+deletedAt+isActive

#### Category
- parentId+order, path, slug, isActive+showInMenu, isFeatured, deletedAt, parentId+isActive+order, نصي: name, description (full-text)

#### Brand
- slug, name, isActive+sortOrder

#### Media
- category+createdAt(desc), نصي: name, description, tags (full-text), fileHash(sparse), uploadedBy+createdAt(desc), deletedAt, category+deletedAt+createdAt(desc)

#### Address
- userId+isDefault, userId+deletedAt, userId+isActive+createdAt(desc), userId+addressType, city+region, coords (2dsphere,sparse), placeId(sparse), lastUsedAt(desc)

#### Cart
- userId+status+updatedAt(desc), deviceId+status+updatedAt(desc), status+lastActivityAt(desc), isAbandoned+abandonmentEmailsSent, expiresAt (TTL: expireAfterSeconds 0), createdAt(desc), updatedAt(desc), convertedToOrderId(sparse)

#### Order
- orderNumber(unique), userId+status+createdAt(desc), status+createdAt(desc), paymentStatus+createdAt(desc), paymentIntentId(unique,sparse), trackingNumber(sparse), paidAt(sparse), deliveredAt(sparse), createdAt(desc), updatedAt(desc), deliveryAddress.city+status, total(desc)+currency

#### Favorite
- مركبة فريدة (userId,productId,variantId) مع partialFilterExpression للمستخدمين
- مركبة فريدة (deviceId,productId,variantId) مع partialFilterExpression للزوار
- userId+createdAt(desc), deviceId+createdAt(desc), productId+deletedAt, deletedAt, isSynced

#### Attribute
- slug, nameEn, isActive+order, isFilterable, groupId, deletedAt

#### AttributeValue
- attributeId+order, attributeId+slug(unique), deletedAt, attributeId+isActive+order
