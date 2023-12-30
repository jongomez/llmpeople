import { PRIVACY_POLICY_ACCEPTED_KEY } from "@/lib/mainStateUtils";
import { MainStateDispatch } from "@/lib/types";
import { useEffect } from "react";
import styled from "styled-components";

type PrivacyPolicyProps = {
  mainStateDispatch: MainStateDispatch;
  hasAcceptedPrivacyPolicy: boolean;
};

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  mainStateDispatch,
  hasAcceptedPrivacyPolicy,
}) => {
  useEffect(() => {
    const hasAcceptedPrivacyPolicyFromLocalStorage = Boolean(
      localStorage.getItem(PRIVACY_POLICY_ACCEPTED_KEY) === "true"
    );

    if (!hasAcceptedPrivacyPolicyFromLocalStorage) {
      mainStateDispatch({ type: "SET_ACCEPTED_PRIVACY_POLICY", payload: false });
    }
  }, [mainStateDispatch]);

  if (hasAcceptedPrivacyPolicy) {
    return null;
  }

  return (
    <PrivacyPolicyContainer>
      <PrivacyPolicyContent>
        <PrivacyPolicyText>
          This website uses the OpenAI API. They collect data. Be sure to read and accept the{" "}
          <PrivacyPolicyLink
            href="#"
            onClick={() => mainStateDispatch({ type: "TOGGLE_ABOUT_MODAL" })}
          >
            data processing policy.
          </PrivacyPolicyLink>
        </PrivacyPolicyText>
        <PrivacyPolicyButton
          onClick={() => mainStateDispatch({ type: "SET_ACCEPTED_PRIVACY_POLICY", payload: true })}
        >
          I Accept
        </PrivacyPolicyButton>
      </PrivacyPolicyContent>
    </PrivacyPolicyContainer>
  );
};

const PrivacyPolicyButton = styled.button`
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
  display: inline-block;
  font-weight: 400;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 20px;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-left: 12px;
`;

const PrivacyPolicyText = styled.p`
  margin-right: 12px;
  text-align: center;
  line-height: 20px;
`;

const PrivacyPolicyLink = styled.a`
  line-height: 20px;
  color: #007bff;
  cursor: pointer;
  text-decoration: underline;
`;

const PrivacyPolicyContent = styled.div`
  border: 1px solid #dee2e6;
  border-radius: 12px;
  max-width: 100%;
  width: 500px;
  padding: 10px;
  align-items: center;
  background-color: white;
  flex-direction: column;
  display: flex;

  margin: 0 10px;
`;

const PrivacyPolicyContainer = styled.div`
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  display: flex;
  margin: 0 auto;
  z-index: 10000;

  max-width: 500px;
`;
