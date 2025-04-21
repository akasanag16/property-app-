
-- Create a function to safely create an invitation
CREATE OR REPLACE FUNCTION public.create_invitation(
  p_property_id UUID,
  p_email TEXT,
  p_link_token TEXT,
  p_type TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_invitation_id UUID;
BEGIN
  IF p_type = 'tenant' THEN
    INSERT INTO public.tenant_invitations (
      property_id,
      email,
      link_token,
      status
    ) VALUES (
      p_property_id,
      p_email,
      p_link_token,
      'pending'
    )
    RETURNING id INTO new_invitation_id;
  ELSE
    INSERT INTO public.service_provider_invitations (
      property_id,
      email,
      link_token,
      status
    ) VALUES (
      p_property_id,
      p_email,
      p_link_token,
      'pending'
    )
    RETURNING id INTO new_invitation_id;
  END IF;
  
  RETURN new_invitation_id;
END;
$$;

-- Create a function to safely update invitation expiry
CREATE OR REPLACE FUNCTION public.update_invitation_expiry(
  p_invitation_id UUID,
  p_invitation_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_invitation_type = 'tenant' THEN
    UPDATE public.tenant_invitations
    SET expires_at = now() + interval '7 days'
    WHERE id = p_invitation_id;
  ELSE
    UPDATE public.service_provider_invitations
    SET expires_at = now() + interval '7 days'
    WHERE id = p_invitation_id;
  END IF;
END;
$$;

-- Create a function to safely get property invitations
CREATE OR REPLACE FUNCTION public.get_property_invitations(
  p_property_id UUID,
  p_type TEXT
)
RETURNS SETOF JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_type = 'tenant' THEN
    RETURN QUERY
    SELECT to_jsonb(i) FROM public.tenant_invitations i
    WHERE i.property_id = p_property_id
    ORDER BY i.created_at DESC;
  ELSE
    RETURN QUERY
    SELECT to_jsonb(i) FROM public.service_provider_invitations i
    WHERE i.property_id = p_property_id
    ORDER BY i.created_at DESC;
  END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_invitation TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_invitation_expiry TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_property_invitations TO authenticated;
