import { WithStyle } from '@medly-components/utils';
import React, { FC } from 'react';
import StayCurrentLandscapeIconSvg from '../../assets/Communication/stay_current_landscape_24px_rounded.svg';
import SvgIcon, { SvgIconProps } from '../../SvgIcon';

const Component: FC<SvgIconProps> = React.memo(props => {
    const { size, withHoverEffect, color, margin, ...restProps } = props;
    return (
        <SvgIcon {...{ size, withHoverEffect, color, margin, ...restProps }}>
            <StayCurrentLandscapeIconSvg {...restProps} width="1em" height="1em" />
        </SvgIcon>
    );
});
Component.displayName = 'StayCurrentLandscapeIcon';

const StayCurrentLandscapeIcon: FC<SvgIconProps> & WithStyle = Object.assign(Component, { Style: SvgIcon })

export default StayCurrentLandscapeIcon
