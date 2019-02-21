<?php
/**
 * @file
 * Contains the main entry point to the admin.
 */

namespace Os2Display\AdminBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use JMS\Serializer\SerializationContext;

/**
 * @Route("/")
 */
class MainController extends Controller
{
    /**
     * @Route("/")
     */
    public function indexAction()
    {
        $templateService = $this->container->get('os2display.template_service');
        $serializer = $this->container->get('jms_serializer');

        $templateRenderArray = [
            'screens' => json_decode($serializer->serialize($templateService->getAllScreenTemplates(), 'json', SerializationContext::create()->setGroups(array('api')))),
            'slides' => json_decode($serializer->serialize($templateService->getAllSlideTemplates(), 'json', SerializationContext::create()->setGroups(array('api')))),
        ];

        // Get current user.
        $user = $this->getUser();
        $user->buildRoleGroups();
        $user = $this->get('os2display.api_data')->setApiData($user);
        $user = $this->get('jms_serializer')
            ->serialize($user, 'json', SerializationContext::create()
                ->setGroups(array('api'))
                ->enableMaxDepthChecks());

        // Get angular modules and apps from other bundles.
        $externalAssets = $this->container->hasParameter('external_assets') ?
            $this->container->getParameter('external_assets') : [];
        $externalModules = $this->container->hasParameter('external_modules') ?
            $this->container->getParameter('external_modules') : [];
        $externalApps = $this->container->hasParameter('external_apps') ?
            $this->container->getParameter('external_apps') : [];
        $externalBootstrap = $this->container->hasParameter('external_bootstrap') ?
            $this->container->getParameter('external_bootstrap') : [];

        $mergedAssets = array_merge(
            $this->container->hasParameter('assets') ?
                $this->container->getParameter('assets') :
                [],
            $externalAssets
        );
        $mergedApps = array_merge(
            $this->container->hasParameter('apps') ?
                $this->container->getParameter('apps') :
                [],
            $externalApps
        );
        $mergedBootstrap = array_merge(
            $this->container->hasParameter('bootstrap') ?
                $this->container->getParameter('bootstrap') :
                [],
            $externalBootstrap
        );
        $mergedModules = array_merge(
            $this->container->hasParameter('modules') ?
                $this->container->getParameter('modules') :
                [],
            $externalModules
        );

        return $this->render(
            'Os2DisplayAdminBundle:Main:index.html.twig',
            [
                'assets' => $mergedAssets,
                'apps' => $mergedApps,
                'bootstrap' => $mergedBootstrap,
                'modules' => $mergedModules,
                'templates' => $templateRenderArray,
                'jsonTemplates' => json_encode($templateRenderArray),
                'user' => $user
            ]
        );
    }
}
