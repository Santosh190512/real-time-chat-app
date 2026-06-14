from django.urls import path

from .views import LogoutView, PhoneLoginView, ProfileView, RegisterView, UserListView, UserSearchView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("phone-login/", PhoneLoginView.as_view(), name="phone-login"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("users/", UserListView.as_view(), name="users"),
    path("search/", UserSearchView.as_view(), name="search-users"),
    path("logout/", LogoutView.as_view(), name="logout"),
]
