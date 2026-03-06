from rest_framework.permissions import BasePermission
from django.contrib.auth.models import Permission


class RoutePermission(BasePermission):
    """Permission class that checks for a permission matching a view attribute
    (`required_permission`) or derived from the request path.

    Behavior:
    - If view.required_permission is set, use that codename.
    - Otherwise derive a codename from the request path: `/users/` -> `access__users` -> normalized to `access_users`.
    - If the permission exists in the DB, require the user to have it (via `has_perm`, user_permissions or group permissions).
    - If the permission does not exist, allow access only to staff/superuser (safe default).
    """

    def normalize_codename(self, path: str) -> str:
        # Convert path to a safe codename: replace '/' with '_' and remove non-alnum/_
        s = path.strip()
        if s.startswith('/'):
            s = s[1:]
        s = s.replace('/', '_')
        # remove query params if present
        s = s.split('?')[0]
        # replace multiple underscores
        while '__' in s:
            s = s.replace('__', '_')
        s = s.strip('_')
        if not s:
            return 'access_root'
        return f'access_{s}'

    def has_permission(self, request, view) -> bool:
        user = request.user
        if not user or not getattr(user, 'is_authenticated', False):
            return False

        # prefer explicit permission declared on the view
        codename = getattr(view, 'required_permission', None)
        if not codename:
            codename = self.normalize_codename(request.path)

        # look for permissions with that codename
        try:
            perms = Permission.objects.filter(codename=codename)
        except Exception:
            return False

        # If no permission defined, default to staff/superuser only
        if not perms.exists():
            return bool(getattr(user, 'is_staff', False) or getattr(user, 'is_superuser', False))

        # If permission(s) exist, check if user has any of them
        for perm in perms:
            app_label = perm.content_type.app_label
            full_perm = f"{app_label}.{codename}"
            # preferred check
            has = False
            try:
                if hasattr(user, 'has_perm') and user.has_perm(full_perm):
                    return True
            except Exception:
                pass

            # fallback checks: direct user permissions or group permissions
            if getattr(user, 'user_permissions', None) is not None and user.user_permissions.filter(codename=codename).exists():
                return True

            if getattr(user, 'groups', None) is not None and user.groups.filter(permissions__codename=codename).exists():
                return True

        return False
