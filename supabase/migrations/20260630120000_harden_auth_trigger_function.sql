revoke all on function public.create_profile_for_new_auth_user() from public;
revoke all on function public.create_profile_for_new_auth_user() from anon;
revoke all on function public.create_profile_for_new_auth_user() from authenticated;

comment on function public.create_profile_for_new_auth_user()
is 'Auth trigger only. Direct execute access is revoked for public API roles.';
